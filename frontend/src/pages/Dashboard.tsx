import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      {user && (
        <div>
          <p>Bienvenido, <span className="font-semibold">{user.nombre}</span></p> 
        </div>
      )}
    </div>
  );
} 