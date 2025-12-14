
import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Badge, ProgressBar, Table, Alert, Spinner } from 'react-bootstrap';
import { Award, ShoppingBag, Percent } from 'react-feather';
import { mockLevels } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useCart, CartItem } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Product } from '../types/Product';

// ----------------------------------------------------
// INTERFACES Y TIPOS
// ----------------------------------------------------
interface Reward {
  id: string;
  type: 'Producto' | 'Descuento' | 'Envio';
  name: string;
  pointsCost: number;
  description: string;
  isActive: boolean;
  season: string;
  imageUrl: string;
  discountType?: string;
  discountValue?: number;
  stock?: number | null;
  stockAvailable?: number | null;
}

type ProductAddToCartFunction = (product: Product, quantity?: number, isRedeemed?: boolean, pointsCost?: number) => void;

const API_URL = '/api/rewards';

// ----------------------------------------------------
// COMPONENTE RewardRow (EXTRAÍDO Y CORREGIDO)
// ----------------------------------------------------
const RewardRow: React.FC<{
  reward: Reward;
  currentPoints: number;
  productAddToCart: ProductAddToCartFunction;
  cartItems: CartItem[];
}> = ({ reward, currentPoints, productAddToCart, cartItems }) => {

  const canAfford = currentPoints >= reward.pointsCost;
  const [loading, setLoading] = useState(false);
  const isAlreadyInCart = cartItems.some(item => item.product.id === `reward-${reward.id}`);

  const handleRedeem = async () => {
    if (!canAfford || isAlreadyInCart) return;

    setLoading(true);
    try {
      const mockProduct: Product = {
        id: `reward-${reward.id}`,
        name: `[CANJE] ${reward.name}`,
        price: 0,
        imageUrl: reward.imageUrl,
        countInStock: 1,
        rating: 0,
        numReviews: 0,
        isTopSelling: false,
        description: reward.description,
        category: 'Recompensa',
        reviews: [],
        specifications: JSON.stringify({ Origen: 'Recompensa' }),
        active: false,
        // 🎯 AGREGAR ESTOS CAMPOS DEL REWARD
        discountType: (reward as any).discountType,
        discountValue: (reward as any).discountValue
      };

      productAddToCart(mockProduct, 1, true, reward.pointsCost);
      toast.success(`¡${reward.name} añadido al carrito!`);

    } catch (err: any) {
      toast.error('Error al añadir el canje al carrito.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr>
      <td className="align-middle">
        {reward.type === 'Producto' ? <ShoppingBag size={20} className="me-2 text-info" /> : <Percent size={20} className="me-2 text-warning" />}
        {reward.name}
        <Badge bg={reward.type === 'Producto' ? 'info' : reward.type === 'Envio' ? 'danger' : 'warning'} className="ms-2" pill>{reward.type}</Badge>
      </td>
      <td className="align-middle text-end">
        <strong style={{ color: '#39FF14' }}>{reward.pointsCost} pts</strong>
      </td>
      <td className="align-middle text-muted">{reward.description}</td>
      <td className="align-middle text-center">
        <Button
          variant={isAlreadyInCart ? 'outline-light' : (canAfford ? 'success' : 'secondary')}
          disabled={!canAfford || loading || isAlreadyInCart}
          onClick={handleRedeem}
        >
          {isAlreadyInCart ? 'En el carrito' : loading ? 'Procesando...' : (canAfford ? 'Canjear' : `Faltan ${reward.pointsCost - currentPoints} pts`)}
        </Button>
      </td>
    </tr>
  );
};

// ----------------------------------------------------
// PÁGINA PRINCIPAL
// ----------------------------------------------------
const RewardsPage: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();

  const [rewardsList, setRewardsList] = useState<Reward[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const fetchRewards = async () => {
      setLoadingRewards(true);
      try {
        const { data } = await axios.get(API_URL);
        setRewardsList(data);
      } catch (err) {
        console.error('Error al cargar recompensas:', err);
        toast.error('No se pudieron cargar las recompensas.');
      } finally {
        setLoadingRewards(false);
      }
    };
    fetchRewards();
  }, []);

  if (!user) {
    return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
  }

  const currentPoints = user.points;
  const currentLevel = mockLevels.filter(level => level.minPoints <= currentPoints).sort((a, b) => b.minPoints - a.minPoints)[0] || mockLevels[0];
  const nextLevel = mockLevels.find(level => level.minPoints > currentPoints);
  const progress = nextLevel ? Math.min(((currentPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100, 100) : 100;

  return (
    <Container className="py-5">
      <h1 className="text-center mb-5 display-4" style={{ color: '#1E90FF' }}><Award className="me-3" size={36} /> Centro de Recompensas</h1>

      <Card className="mb-5 shadow-lg border-primary" style={{ backgroundColor: '#111', color: 'white', border: '1px solid #1E90FF' }}>
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4} className="text-center border-end border-secondary">
              <p className="mb-0 text-muted">Tus Puntos Acumulados</p>
              <h2 className="display-3" style={{ color: '#39FF14' }}>{currentPoints}</h2>
            </Col>
            <Col md={8}>
              <h4>Nivel Actual: <Badge bg="dark">{currentLevel.name}</Badge></h4>
              {nextLevel ? (
                <>
                  <p className="text-muted">Acumula {nextLevel.minPoints - currentPoints} pts más para alcanzar el nivel {nextLevel.name}.</p>
                  <ProgressBar animated variant="warning" now={progress} label={`${Math.round(progress)}%`} />
                </>
              ) : (
                <p className="text-success">¡Has alcanzado el nivel máximo!</p>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <h2 className="text-center mb-4 border-bottom pb-2" style={{ color: '#1E90FF' }}>🎁 Canjea tus Puntos</h2>

      {loadingRewards ? (
        <Container className="py-3 text-center"><Spinner animation="border" /></Container>
      ) : rewardsList.length === 0 ? (
        <Alert variant="secondary" className="text-center">No hay recompensas activas en este momento.</Alert>
      ) : (
        <Table striped bordered hover responsive className="table-dark" style={{ backgroundColor: '#111', color: 'white' }}>
          <thead>
            <tr><th>Recompensa</th><th className="text-end">Costo en Puntos</th><th>Descripción</th><th className="text-center">Acción</th></tr>
          </thead>
          <tbody>
            {rewardsList.map((reward) => (
              <RewardRow
                key={reward.id}
                reward={reward}
                currentPoints={currentPoints}
                productAddToCart={addToCart}
                cartItems={cartItems}
              />
            ))}
          </tbody>
        </Table>
      )}

      {user.hasDuocDiscount && (
        <Alert variant="success" className="mt-4 text-center">¡Tienes el 20% de descuento DUOCUC activo en todas tus compras!</Alert>
      )}
    </Container>
  );
};

export default RewardsPage;