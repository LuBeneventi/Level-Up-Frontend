// level-up-gaming-frontend/src/pages/CheckoutPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Card, ListGroup, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth, User as AuthUser } from '../context/AuthContext';
import axios from 'axios';
import { Truck, CreditCard, CheckCircle } from 'react-feather';
// 🚨 IMPORTACIÓN CRÍTICA DEL JSON LOCAL
import CHILEAN_REGIONS_DATA from '../data/chile_regions.json';


// Definición de las interfaces (Necesarias para el tipado)
interface ShippingAddress { street: string; city: string; region: string; zipCode?: string; }
interface OrderItem { name: string; price: number; quantity: number; qty?: number; }
interface Order { id: string; userId: string; items: OrderItem[]; shippingAddress: ShippingAddress; paymentMethod: 'webpay' | 'transferencia' | 'efectivo'; totalPrice: number; shippingPrice: number; isPaid: boolean; status: string; createdAt: string; }

// CONSTANTES GLOBALES
const CLP_FORMATTER = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
const formatClp = (amount: number) => CLP_FORMATTER.format(amount);
const FREE_SHIPPING_THRESHOLD_CLP = 100000;
const POINTS_RATE = 1000; // 10 puntos por cada 1000 CLP gastados
const COUPON_MONETARY_VALUE = 5000; // Valor del cupón 102
const COUPON_PERCENT_RATE = 0.15; // Valor del cupón 106 (15%)


// 🚨 FUNCIÓN CRÍTICA: LÓGICA DE ENVÍO POR REGIÓN (Simulación)
const getShippingCost = (region: string, isFree: boolean): number => {
    if (isFree) return 0;

    const lowerRegion = region.toLowerCase();

    // Simulación de costos fijos usando nombres clave de región
    if (lowerRegion.includes('metropolitana') || lowerRegion.includes('santiago')) {
        return 5000; // RM: Más barato
    }
    // Biobío o zonas extremas simuladas
    if (lowerRegion.includes('biobío') || lowerRegion.includes('araucanía') || lowerRegion.includes('magallanes') || lowerRegion.includes('los lagos')) {
        return 10000; // Zonas más costosas
    }
    // Resto del país
    return 7500;
};


// ----------------------------------------------------
// COMPONENTE: RESUMEN DE LA ORDEN (AUXILIAR)
// ----------------------------------------------------

interface SummaryProps {
    subtotal: number;
    shippingPrice: number;
    discountDuoc: number;
    discountCouponValue: number;
    discountPercentValue: number;
    totalPointsRedeemed: number;
    discountRate: number;
    totalOrder: number;
    user: AuthUser | null;
}

const OrderSummary: React.FC<SummaryProps> = ({ subtotal, shippingPrice, discountDuoc, discountCouponValue, discountPercentValue, totalPointsRedeemed, discountRate, totalOrder, user }) => {
    const pointsEarned = Math.floor(subtotal / POINTS_RATE) * 10;

    return (
        <Card className="p-4 shadow-lg" style={{ backgroundColor: '#111', border: '1px solid #39FF14', color: 'white' }}>
            <h4 className="mb-3" style={{ color: '#39FF14' }}>Resumen de Compra</h4>
            <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between" style={{ backgroundColor: 'transparent', borderBottomColor: '#333' }}>
                    <span style={{ color: '#39FF14' }}>Subtotal Artículos:</span>
                    <span style={{ color: '#858585ff' }}>{formatClp(subtotal)}</span>
                </ListGroup.Item>

                {/* 1. Descuento DUOCUC (Si aplica) */}
                {discountDuoc > 0 && discountRate > 0 && (
                    <ListGroup.Item className="d-flex justify-content-between fw-bold" style={{ backgroundColor: 'transparent', borderBottomColor: '#333', color: '#39FF14' }}>
                        <span>Descuento DUOCUC ({discountRate * 100}%):</span>
                        <span>-{formatClp(discountDuoc)}</span>
                    </ListGroup.Item>
                )}

                {/* 2. Descuento de CUPÓN 15% */}
                {discountPercentValue > 0 && (
                    <ListGroup.Item className="d-flex justify-content-between fw-bold" style={{ backgroundColor: 'transparent', borderBottomColor: '#333', color: '#39FF14' }}>
                        <span>Cupón 15% OFF:</span>
                        <span>-{formatClp(discountPercentValue)}</span>
                    </ListGroup.Item>
                )}

                {/* 3. Descuento de CUPONES CANJEADOS (Valor Monetario) */}
                {discountCouponValue > 0 && (
                    <ListGroup.Item className="d-flex justify-content-between fw-bold" style={{ backgroundColor: 'transparent', borderBottomColor: '#333', color: '#39FF14' }}>
                        <span>Cupón Descuento Fijo:</span>
                        <span>-{formatClp(discountCouponValue)}</span>
                    </ListGroup.Item>
                )}

                {/* Puntos a restar (para el resumen) */}
                {totalPointsRedeemed > 0 && (
                    <ListGroup.Item className="d-flex justify-content-between fw-bold" style={{ backgroundColor: 'transparent', borderBottomColor: '#333', color: '#FFC107' }}>
                        <span>Puntos a Canjear:</span>
                        <span>{totalPointsRedeemed} pts</span>
                    </ListGroup.Item>
                )}

                <ListGroup.Item className="d-flex justify-content-between" style={{ backgroundColor: 'transparent', borderBottomColor: '#333' }}>
                    <span style={{ color: '#39FF14' }}>Envío Estimado:</span>
                    <span style={{ color: shippingPrice === 0 ? 'yellow' : 'grey' }}>
                        {shippingPrice === 0 ? 'GRATIS' : formatClp(shippingPrice)}
                    </span>
                </ListGroup.Item>

                <ListGroup.Item className="d-flex justify-content-between fw-bold mt-3" style={{ backgroundColor: 'transparent', borderTop: '2px solid #1E90FF', color: 'white' }}>
                    <span>Total Final:</span>
                    <span style={{ color: '#39FF14', fontSize: '1.4rem' }}>{formatClp(totalOrder)}</span>
                </ListGroup.Item>

                {user && (
                    <ListGroup.Item className="mt-3 text-center" style={{ backgroundColor: 'transparent', color: 'white', borderTop: '1px dashed #333' }}>
                        <span style={{ color: '#1E90FF' }}>¡Ganarás {pointsEarned} puntos!</span> (Total: {user.points} pts)
                    </ListGroup.Item>
                )}
            </ListGroup>
        </Card>
    );
};


import InvoiceModal from '../components/InvoiceModal';


// ----------------------------------------------------
// PÁGINA PRINCIPAL DE CHECKOUT
// ----------------------------------------------------

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, totalPrice, clearCart, cartCount } = useCart();
    const { user, isLoggedIn, setUserFromRegistration } = useAuth();

    const [step, setStep] = useState(1);
    const [useRegisteredAddress, setUseRegisteredAddress] = useState(true);
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(user?.address || { street: '', city: '', region: '' });
    const [shippingNotes, setShippingNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'webpay' | 'transferencia' | 'efectivo'>('webpay');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);

    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    // 🚨 ESTADO PARA LAS COMUNAS DISPONIBLES EN EL SELECT
    const [availableCommunes, setAvailableCommunes] = useState<string[]>([]);


    // Redirigir si el carrito está vacío o no está logueado
    useEffect(() => {
        if (cartItems.length === 0) { navigate('/carrito'); }
        if (!isLoggedIn) { navigate('/login'); }
    }, [cartItems, isLoggedIn, navigate]);


    // 🚨 EFECTO PARA SINCRONIZAR LA DIRECCIÓN REGISTRADA Y LAS COMUNAS
    useEffect(() => {
        const currentRegionName = shippingAddress.region;

        // 1. Encontrar el objeto de la región en el JSON
        const selectedRegionData = CHILEAN_REGIONS_DATA.find((reg: any) => reg.region === currentRegionName);

        // 2. Obtener las comunas de esa región (flat map recorre las provincias)
        const communes = selectedRegionData
            ? selectedRegionData.provincias.flatMap((p: any) => p.comunas)
            : [];
        setAvailableCommunes(communes);

        // 3. Sincronizar campos
        if (useRegisteredAddress && user?.address) {
            setShippingAddress(user.address);
        } else if (!useRegisteredAddress) {
            // Si cambia a "otra dirección", limpia los campos de la calle y ciudad, pero mantiene la región
            setShippingAddress(prev => ({ street: '', city: '', region: prev.region, zipCode: '' }));
        }

        // Si cambia la región y la ciudad actual no está en la nueva lista, la limpiamos
        if (shippingAddress.city && communes.length > 0 && !communes.includes(shippingAddress.city)) {
            setShippingAddress(prev => ({ ...prev, city: '' }));
        }

    }, [useRegisteredAddress, user, shippingAddress.region]);


    // CÁLCULO DE COSTOS Y DESCUENTOS
    const subtotal = totalPrice;

    // 1. Descuento DUOCUC (se aplica primero)
    const discountRate = user?.hasDuocDiscount ? 0.20 : 0;
    const discountDuoc = subtotal * discountRate;
    const subtotalAfterDuoc = subtotal - discountDuoc;

    // 2. Variables para Canjes Aplicados
    let totalPointsToRedeem = 0;
    let totalMonetaryCouponValue = 0;
    let totalDiscountAppliedPercent = 0;
    let isShippingFree = subtotal >= FREE_SHIPPING_THRESHOLD_CLP; // Envío gratis por monto

    cartItems.forEach(item => {
        if (item.isRedeemed && item.pointsCost) {
            totalPointsToRedeem += item.pointsCost * item.quantity;

            // 🎯 Sistema dinámico de descuentos basado en propiedades del reward
            const discountType = (item.product as any).discountType;
            const discountValue = (item.product as any).discountValue;

            if (discountType === 'FREE_SHIPPING') {
                // Envío gratis
                isShippingFree = true;
            } else if (discountType === 'FIXED_AMOUNT' && discountValue) {
                // Descuento de monto fijo (ej: $5000)
                totalMonetaryCouponValue += discountValue * item.quantity;
            } else if (discountType === 'PERCENTAGE' && discountValue) {
                // Descuento porcentual (ej: 15%, 20%)
                // Se aplica sobre el subtotal después del descuento DUOCUC
                totalDiscountAppliedPercent += subtotalAfterDuoc * discountValue * item.quantity;
            }
        }
    });

    // 3. APLICACIÓN FINAL DEL TOTAL
    // Orden: DUOCUC -> Descuento % -> Descuento fijo
    const totalDiscountApplied = discountDuoc + totalDiscountAppliedPercent + totalMonetaryCouponValue;

    const finalTotalAfterAllDiscounts = Math.max(0, subtotal - totalDiscountApplied);

    // Costo de Envío (con lógica por región)
    const shippingPrice = getShippingCost(shippingAddress.region, isShippingFree);

    const totalOrder = finalTotalAfterAllDiscounts + shippingPrice;

    const pointsEarned = Math.floor(finalTotalAfterAllDiscounts / POINTS_RATE) * 10;


    // Función que simula la descarga de la boleta 
    const handleDownloadInvoice = (orderId: string) => {
        console.log(`Boleta #${orderId.slice(0, 8)} GENERADA y lista.`);
    };


    // ----------------------------------------------------
    // LÓGICA DE FINALIZACIÓN DE COMPRA (Place Order)
    // ----------------------------------------------------
    const placeOrderHandler = async () => {
        setLoading(true);
        setError(null);

        // VALIDACIÓN: Asegurar que todos los campos de envío estén llenos
        if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.region || shippingAddress.region === '') {
            setError('Por favor, complete todos los campos de dirección.');
            setLoading(false);
            return;
        }

        try {
            // Calcular la ganancia neta de puntos
            const netPointsChange = pointsEarned - totalPointsToRedeem;

            // 1. CREAR ORDEN
            const payload = {
                userId: user?.id,
                items: cartItems,
                shippingAddress: { ...shippingAddress, notes: shippingNotes },
                paymentMethod,
                totalPrice: totalOrder,
                shippingPrice: shippingPrice,
            };

            const resOrder = await axios.post<Order>('/api/orders', payload);
            const createdOrder = resOrder.data;

            // 2. ACTUALIZAR PUNTOS DEL USUARIO (Ganancia neta)
            if (user && netPointsChange !== 0) {
                const resPoints = await axios.put<AuthUser>(`/api/users/${user.id}/points`, { pointsToAdd: netPointsChange });
                // 🚨 FIX: Preservar el token actual, ya que el backend podría devolver uno viejo de la DB
                const updatedUser = { ...resPoints.data, token: user.token };
                setUserFromRegistration(updatedUser);
            }

            // 3. ABRIR MODAL Y FINALIZAR
            handleDownloadInvoice(createdOrder.id);
            setOrder(createdOrder);
            setShowInvoiceModal(true);

        } catch (error: any) {
            setError(error.response?.data?.message || 'Error al completar la compra. Revisa la consola del servidor.');
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------
    // VISTAS DE CADA PASO
    // ----------------------------------------------------

    const Step1Shipping = (
        <Card className="p-4" style={{ backgroundColor: '#111', border: '1px solid #1E90FF' }}>
            <h4 style={{ color: '#1E90FF' }}>1. Dirección de Envío</h4>

            {/* 🚨 TOGGLE PARA ELEGIR DIRECCIÓN */}
            <Form.Group className="mb-3">
                <Form.Check
                    type="switch"
                    id="address-switch"
                    label={user?.address?.street ? `Usar dirección registrada: (${shippingAddress.street}, ${shippingAddress.region})` : "Usar nueva dirección"}
                    checked={useRegisteredAddress}
                    onChange={(e) => setUseRegisteredAddress(e.target.checked)}
                    disabled={!user?.address?.street} // Deshabilitar si no hay dirección guardada
                    style={{ color: '#1E90FF' }}
                />
            </Form.Group>

            {/* 🚨 FORMULARIO DINÁMICO */}
            <Form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <Form.Group className="mb-3"><Form.Label style={{ color: '#868686ff' }}>Calle y Número</Form.Label>
                    <Form.Control
                        type="text"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                        required
                        disabled={useRegisteredAddress && !!user?.address?.street} // Deshabilita si usa registrada
                        style={{ backgroundColor: '#333', color: 'white' }}
                    />
                </Form.Group>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3"><Form.Label style={{ color: '#868686ff' }}>Región</Form.Label>
                            <Form.Select
                                value={shippingAddress.region}
                                // Al cambiar la Región, actualizamos la lista de comunas y reseteamos la ciudad
                                onChange={(e) => setShippingAddress({ ...shippingAddress, region: e.target.value, city: '' })}
                                required
                                disabled={useRegisteredAddress && !!user?.address?.region}
                                style={{ backgroundColor: '#333', color: 'white' }}
                            >
                                <option value="">Seleccione Región</option>
                                {/* 🚨 Renderiza las regiones desde la data local (CORREGIDO) */}
                                {CHILEAN_REGIONS_DATA.map((reg: any) => (<option key={reg.region} value={reg.region}>{reg.region}</option>))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3"><Form.Label style={{ color: '#868686ff' }}>Ciudad / Comuna</Form.Label>
                            <Form.Select
                                value={shippingAddress.city}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                required
                                // Deshabilita si usa registrada o si no se ha seleccionado región
                                disabled={(useRegisteredAddress && !!user?.address?.city) || availableCommunes.length === 0}
                                style={{ backgroundColor: '#333', color: 'white' }}
                            >
                                <option value="">Seleccione Comuna</option>
                                {/* 🚨 Renderiza las comunas disponibles */}
                                {availableCommunes.map(city => (<option key={city} value={city}>{city}</option>))}
                            </Form.Select>
                            {availableCommunes.length === 0 && shippingAddress.region && (
                                <Form.Text className="text-danger">Seleccione una región válida primero.</Form.Text>
                            )}
                        </Form.Group>
                    </Col>
                </Row>

                {/* 🚨 CAMPO DE INDICACIONES */}
                <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#868686ff' }}>Indicaciones / Dirección difícil de encontrar (Opcional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        value={shippingNotes}
                        onChange={(e) => setShippingNotes(e.target.value)}
                        style={{ backgroundColor: '#333', color: 'white' }}
                    />
                    <Form.Text className="text-muted">Ej: "Casa azul con portón blanco, llamar antes de llegar."</Form.Text>
                </Form.Group>

                <Button type="submit" variant="primary" className="mt-3 w-100">Continuar a Pago</Button>
            </Form>
        </Card>
    );

    const Step2Payment = (
        <Card className="p-4" style={{ backgroundColor: '#111', border: '1px solid #1E90FF' }}>
            <h4 style={{ color: '#1E90FF' }}>2. Método de Pago</h4>
            <ListGroup className="mt-3 mb-3">
                <ListGroup.Item style={{ backgroundColor: '#333', color: 'white' }} className="fw-bold">
                    Artículos en el Carrito: {cartCount} unidades.
                </ListGroup.Item>
            </ListGroup>

            <ListGroup>
                <ListGroup.Item style={{ backgroundColor: '#222', color: 'white' }}>
                    <Form.Check type="radio" label="WebPay / Tarjeta de Crédito (Recomendado)" name="paymentMethod" id="webpay" value="webpay" checked={paymentMethod === 'webpay'} onChange={(e) => setPaymentMethod(e.target.value as 'webpay')} />
                </ListGroup.Item>
                <ListGroup.Item style={{ backgroundColor: '#222', color: 'white' }}>
                    <Form.Check type="radio" label="Transferencia Bancaria" name="paymentMethod" id="transferencia" value="transferencia" checked={paymentMethod === 'transferencia'} onChange={(e) => setPaymentMethod(e.target.value as 'transferencia')} />
                </ListGroup.Item>
                <ListGroup.Item style={{ backgroundColor: '#222', color: 'white' }}>
                    <Form.Check type="radio" label="Efectivo (Solo Retiro en Tienda)" name="paymentMethod" id="efectivo" value="efectivo" checked={paymentMethod === 'efectivo'} onChange={(e) => setPaymentMethod(e.target.value as 'efectivo')} />
                </ListGroup.Item>
            </ListGroup>

            <Button variant="secondary" onClick={() => setStep(1)} className="mt-4 me-2">Volver</Button>
            <Button variant="primary" onClick={() => setStep(3)} className="mt-4">Revisar y Pagar</Button>
        </Card>
    );

    const Step3Review = (
        <Card className="p-4" style={{ backgroundColor: '#111', border: '1px solid #1E90FF' }}>
            <h4 style={{ color: '#1E90FF' }}>3. Resumen y Confirmación</h4>

            <Alert variant="info" style={{ backgroundColor: '#222', border: 'none', color: 'white' }}>
                Revisa los detalles antes de finalizar la compra.
            </Alert>

            <h5 className="mt-3 border-bottom pb-2" style={{ color: '#39FF14' }}>Envío a:</h5>
            <p className="text-muted">{shippingAddress.street}, {shippingAddress.city}, {shippingAddress.region}</p>
            {shippingNotes && <p className="text-muted fst-italic">Notas: {shippingNotes}</p>}

            <h5 className="mt-3 border-bottom pb-2" style={{ color: '#39FF14' }}>Método de Pago:</h5>
            <p className="text-muted">{paymentMethod.toUpperCase()}</p>

            <h5 className="mt-3 border-bottom pb-2" style={{ color: '#39FF14' }}>Artículos:</h5>
            <ListGroup variant="flush">
                {cartItems.map(item => (
                    <ListGroup.Item key={item.product.id} className="d-flex justify-content-between" style={{ backgroundColor: 'transparent', color: 'white', borderBottomColor: '#333' }}>
                        <span>{item.product.name} ({item.quantity} ud.)</span>
                        <span>{formatClp(item.product.price * item.quantity)}</span>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

            <Button variant="secondary" onClick={() => setStep(2)} className="mt-4 me-2">Volver</Button>
            <Button variant="success" onClick={placeOrderHandler} disabled={loading} className="mt-4">
                {loading ? 'Procesando...' : `Pagar y Finalizar Orden (${formatClp(totalOrder)})`}
            </Button>
        </Card>
    );

    // Vista de Confirmación (Boleta aquí)
    const Step4Confirmation = (
        <Card className="p-5 text-center shadow-lg" style={{ backgroundColor: '#111', border: '2px solid #39FF14', color: 'white' }}>
            <CheckCircle size={80} color="#39FF14" className="mb-4 mx-auto" />
            <h2 className="mb-3" style={{ color: '#39FF14' }}>¡Compra Finalizada con Éxito!</h2>
            <p className="lead">Tu orden #{order?.id} ha sido procesada.</p>
            <p className="text-muted">Revisa tu historial de órdenes para ver los detalles completos.</p>

            <div className="d-flex justify-content-center mt-4">
                <Button variant="primary" onClick={() => navigate('/myorders')} className="me-3">Ver Mis Órdenes</Button>
                <Button variant="outline-light" onClick={() => navigate('/')}>Volver al Inicio</Button>
            </div>
        </Card>
    );

    // Renderizado principal
    const renderStep = () => {
        switch (step) {
            case 1: return Step1Shipping;
            case 2: return Step2Payment;
            case 3: return Step3Review;
            case 4: return Step4Confirmation;
            default: return null;
        }
    };

    return (
        <Container className="py-5">
            <h1 className="text-center mb-5" style={{ color: '#1E90FF' }}>Proceso de Pago</h1>

            <Row className="mb-4">
                <Col md={12}>
                    <div className="d-flex justify-content-between text-muted mb-4">
                        <span style={{ color: step >= 1 ? '#39FF14' : 'gray' }}><Truck size={20} className="me-1" /> 1. Envío</span>
                        <span style={{ color: step >= 2 ? '#39FF14' : 'gray' }}><CreditCard size={20} className="me-1" /> 2. Pago</span>
                        <span style={{ color: step >= 3 ? '#39FF14' : 'gray' }}><CheckCircle size={20} className="me-1" /> 3. Confirmación</span>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={7}>
                    {renderStep()}
                </Col>
                <Col md={5}>
                    {step < 4 && (
                        <OrderSummary
                            subtotal={subtotal}
                            shippingPrice={shippingPrice}
                            discountDuoc={discountDuoc}
                            discountCouponValue={totalMonetaryCouponValue}
                            discountPercentValue={totalDiscountAppliedPercent}
                            totalPointsRedeemed={totalPointsToRedeem}
                            discountRate={discountRate}
                            totalOrder={totalOrder}
                            user={user}
                        />
                    )}
                </Col>
            </Row>

            {/* MODAL DE BOLETA (Controla la aparición obligatoria al finalizar la compra) */}
            <InvoiceModal
                show={showInvoiceModal}
                handleClose={() => setShowInvoiceModal(false)}
                order={order}
                // Pasar las funciones de avance al modal
                setStep={setStep}
                clearCart={clearCart}
            />

        </Container>
    );
};

export default CheckoutPage;