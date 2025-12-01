import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit, Trash2, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/Tooltip';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        codigo: '',
        direccion: '',
        valor_venta: '',
        moneda: 'PEN',
        estado: 'Disponible',
    });
    const { t } = useTranslation();

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/properties');
            setProperties(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/properties/${editingId}`, formData);
                toast.success(t('properties.success_updated'));
            } else {
                await api.post('/properties', formData);
                toast.success(t('properties.success_created'));
            }

            setShowForm(false);
            setEditingId(null);
            setFormData({ codigo: '', direccion: '', valor_venta: '', moneda: 'PEN', estado: 'Disponible' });
            fetchProperties();
        } catch (error) {
            console.error(error);
            toast.error(editingId ? t('properties.error_updating') : t('properties.error_creating'));
        }
    };

    const handleEdit = (property) => {
        setEditingId(property._id);
        setFormData({
            codigo: property.codigo,
            direccion: property.direccion,
            valor_venta: property.valor_venta.$numberDecimal,
            moneda: property.moneda || 'PEN',
            estado: property.estado,
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('properties.confirm_delete'))) {
            try {
                await api.delete(`/properties/${id}`);
                toast.success(t('properties.success_deleted'));
                fetchProperties();
            } catch (error) {
                console.error(error);
                toast.error(t('properties.error_deleting'));
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">{t('properties.title')}</h2>
                <Button onClick={() => {
                    setShowForm(!showForm);
                    setEditingId(null);
                    setFormData({ codigo: '', direccion: '', valor_venta: '', moneda: 'PEN', estado: 'Disponible' });
                }}>
                    <Plus className="mr-2 h-4 w-4" /> {t('properties.add_property')}
                </Button>
            </div>

            {showForm && (
                <Card className="animate-in zoom-in-95 duration-300">
                    <CardHeader>
                        <CardTitle>{editingId ? t('properties.edit_property') : t('properties.new_property')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="codigo" className="flex items-center gap-2">
                                        {t('properties.code')}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="h-4 w-4 text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{t('properties.code_tooltip')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </Label>
                                    <Input
                                        id="codigo"
                                        value={formData.codigo}
                                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="direccion">{t('properties.address')}</Label>
                                    <Input
                                        id="direccion"
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="valor_venta" className="flex items-center gap-2">
                                        {t('properties.value')}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="h-4 w-4 text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{t('properties.value_tooltip')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </Label>
                                    <Input
                                        id="valor_venta"
                                        type="number"
                                        value={formData.valor_venta}
                                        onChange={(e) => setFormData({ ...formData, valor_venta: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="moneda">{t('properties.currency')}</Label>
                                    <select
                                        id="moneda"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.moneda}
                                        onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                                    >
                                        <option value="PEN">Soles (PEN)</option>
                                        <option value="USD">Dólares (USD)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="estado">{t('properties.status')}</Label>
                                    <select
                                        id="estado"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    >
                                        <option value="Disponible">Disponible</option>
                                        <option value="Reservado">Reservado</option>
                                        <option value="Vendido">Vendido</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    {t('properties.cancel')}
                                </Button>
                                <Button type="submit">{t('properties.save')}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase">
                        <tr>
                            <th className="px-6 py-3">{t('properties.code')}</th>
                            <th className="px-6 py-3">{t('properties.address')}</th>
                            <th className="px-6 py-3">{t('properties.value')}</th>
                            <th className="px-6 py-3">{t('properties.currency')}</th>
                            <th className="px-6 py-3">{t('properties.status')}</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : properties.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    {t('properties.no_properties')}
                                </td>
                            </tr>
                        ) : properties.map((property) => (
                            <tr key={property._id}>
                                <td className="px-6 py-4 font-medium">{property.codigo}</td>
                                <td className="px-6 py-4">{property.direccion}</td>
                                <td className="px-6 py-4">{property.moneda === 'USD' ? '$' : 'S/'} {property.valor_venta.$numberDecimal}</td>
                                <td className="px-6 py-4">{property.moneda || 'PEN'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${property.estado === 'Disponible' ? 'bg-green-100 text-green-800' :
                                            property.estado === 'Reservado' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {property.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(property)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(property._id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Properties;
