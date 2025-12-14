# Guía de Implementación Segura para Recuperación de Contraseña

Esta guía describe cómo implementar un sistema robusto y seguro de recuperación de contraseña ("Olvidé mi contraseña") utilizando un enfoque basado en tokens enviados por correo electrónico.

## 1. Resumen del Flujo

1.  **Solicitud**: El usuario ingresa su correo electrónico en la página "Olvidé mi contraseña".
2.  **Generación de Token**: El backend verifica si el correo existe. Si es así, genera un token único (UUID o JWT) con un tiempo de expiración corto (ej. 15-30 minutos).
3.  **Almacenamiento**: El token se guarda en la base de datos asociado al usuario.
4.  **Envío de Correo**: El backend envía un correo electrónico al usuario con un enlace que contiene el token (ej. `https://tusitio.com/reset-password?token=xyz123`).
5.  **Verificación**: El usuario hace clic en el enlace. El frontend captura el token de la URL y permite al usuario ingresar una nueva contraseña.
6.  **Restablecimiento**: El frontend envía la nueva contraseña y el token al backend. El backend valida el token (existencia y expiración), actualiza la contraseña y elimina/invalida el token.

---

## 2. Cambios en el Backend (Spring Boot)

### A. Dependencias (`pom.xml`)

Necesitarás agregar `spring-boot-starter-mail` para enviar correos electrónicos.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### B. Configuración de Correo (`application.properties`)

Configura tu servidor SMTP (ej. Gmail, SendGrid, AWS SES).

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=tu-correo@gmail.com
spring.mail.password=tu-contraseña-de-aplicacion
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### C. Modelo de Token (`PasswordResetToken.java`)

Crea una entidad para almacenar los tokens.

```java
@Entity
@Data
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String token;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    private Date expiryDate;

    // Constructor para calcular expiración (ej. 30 min)
    public PasswordResetToken(String token, User user) {
        this.token = token;
        this.user = user;
        this.expiryDate = new Date(System.currentTimeMillis() + 30 * 60 * 1000);
    }
}
```

### D. Controlador (`UserController.java` o `AuthController.java`)

Implementa los endpoints.

```java
@Autowired private JavaMailSender mailSender;

@PostMapping("/forgot-password")
public ResponseEntity<?> forgotPassword(@RequestBody String email) {
    User user = userRepository.findByEmail(email).orElse(null);
    if (user != null) {
        String token = UUID.randomUUID().toString();
        createPasswordResetTokenForUser(user, token); // Guardar en DB
        
        // Enviar email
        SimpleMailMessage message = new SimpleMailMessage(); 
        message.setTo(user.getEmail()); 
        message.setSubject("Restablecer Contraseña"); 
        message.setText("Haz clic aquí para restablecer: " + "http://localhost:3000/reset-password?token=" + token);
        mailSender.send(message);
    }
    // Por seguridad, siempre responder OK incluso si el email no existe (para evitar enumeración de usuarios)
    return ResponseEntity.ok("Si el correo existe, recibirás un enlace.");
}

@PostMapping("/reset-password-secure")
public ResponseEntity<?> resetPasswordSecure(@RequestBody ResetPasswordDto dto) {
    PasswordResetToken passToken = tokenRepository.findByToken(dto.getToken());
    if (passToken == null || passToken.getExpiryDate().before(new Date())) {
        return ResponseEntity.badRequest().body("Token inválido o expirado.");
    }
    
    User user = passToken.getUser();
    user.setPassword(dto.getNewPassword()); // Recuerda encriptar la contraseña
    userRepository.save(user);
    tokenRepository.delete(passToken); // Invalidar token
    
    return ResponseEntity.ok("Contraseña actualizada.");
}
```

---

## 3. Cambios en el Frontend (React)

### A. Página de Solicitud (`ForgotPasswordPage.tsx`)

Un formulario simple que pide el correo y llama a `/api/users/forgot-password`.

### B. Página de Restablecimiento (`ResetPasswordPage.tsx`)

Esta página se carga cuando el usuario hace clic en el enlace del correo.
1.  Lee el parámetro `token` de la URL (`useSearchParams`).
2.  Muestra un formulario para ingresar la "Nueva Contraseña" y "Confirmar Contraseña".
3.  Al enviar, llama a `/api/users/reset-password-secure` con el token y la nueva contraseña.

---

## 4. Consideraciones de Seguridad Adicionales

*   **Rate Limiting**: Limita el número de solicitudes de "Olvidé mi contraseña" desde una misma IP para evitar spam de correos.
*   **No revelar existencia**: El mensaje de respuesta siempre debe ser genérico ("Si el correo existe, se enviaron instrucciones") para que un atacante no pueda saber qué correos están registrados.
*   **Expiración Corta**: Los tokens no deben durar más de 1 hora.
*   **Invalidación**: Al cambiar la contraseña exitosamente, el token debe eliminarse inmediatamente. También, si el usuario solicita un nuevo token, el anterior debe invalidarse.
