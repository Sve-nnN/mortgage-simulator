import { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Home, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalClients: 0,
        totalProperties: 0,
        totalSimulations: 0,
        recentSimulations: [],
        chartData: []
    });
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats');
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (value) => {
        if (!value) return 'S/ 0.00';
        // Handle Decimal128 or string/number
        const num = typeof value === 'object' && value.$numberDecimal
            ? parseFloat(value.$numberDecimal)
            : parseFloat(value);
        return isNaN(num) ? 'S/ 0.00' : `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.total_clients')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalClients}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.total_properties')}</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProperties}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.total_simulations')}</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSimulations}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart */}
                <Card className="col-span-1 hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>{t('dashboard.simulations_chart')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData}>
                                    <defs>
                                        <linearGradient id="colorSimulations" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="simulations" stroke="#2563eb" fillOpacity={1} fill="url(#colorSimulations)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Simulations */}
                <Card className="col-span-1 hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>{t('dashboard.recent_simulations')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentSimulations.length === 0 ? (
                                <p className="text-sm text-muted-foreground">{t('dashboard.no_simulations')}</p>
                            ) : (
                                stats.recentSimulations.map((sim) => (
                                    <div
                                        key={sim._id}
                                        className="flex items-center justify-between border-b pb-2 last:border-0 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                                        onClick={() => navigate(`/simulator?id=${sim._id}`)}
                                    >
                                        <div>
                                            <p className="font-medium text-sm">
                                                {sim.client_id ? `${sim.client_id.nombres} ${sim.client_id.apellidos}` : 'Unknown Client'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(sim.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">{formatCurrency(sim.input_data.monto_prestamo)}</p>
                                            <p className="text-xs text-muted-foreground">{sim.input_data.plazo_meses} months</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
