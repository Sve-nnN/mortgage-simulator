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

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        dni: '',
        nombres: '',
        apellidos: '',
        ingresos: '',
        carga_familiar: 0,
    });
    const { t } = useTranslation();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/clients');
            setClients(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                dni: formData.dni,
                nombres: formData.nombres,
                apellidos: formData.apellidos,
                perfil_socioeconomico: {
                    ingresos: formData.ingresos,
                    carga_familiar: formData.carga_familiar,
                },
            };

            if (editingId) {
                await api.put(`/clients/${editingId}`, payload);
                toast.success(t('clients.success_updated'));
            } else {
                await api.post('/clients', payload);
                toast.success(t('clients.success_created'));
            }

            setShowForm(false);
            setEditingId(null);
            setFormData({ dni: '', nombres: '', apellidos: '', ingresos: '', carga_familiar: 0 });
            fetchClients();
        } catch (error) {
            console.error(error);
            toast.error(editingId ? t('clients.error_updating') : t('clients.error_creating'));
        }
    };

    const handleEdit = (client) => {
        setEditingId(client._id);
        setFormData({
            dni: client.dni,
            nombres: client.nombres,
            apellidos: client.apellidos,
            ingresos: client.perfil_socioeconomico.ingresos.$numberDecimal,
            carga_familiar: client.perfil_socioeconomico.carga_familiar,
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('clients.confirm_delete'))) {
            try {
                await api.delete(`/clients/${id}`);
                toast.success(t('clients.success_deleted'));
                fetchClients();
            } catch (error) {
                console.error(error);
                toast.error(t('clients.error_deleting'));
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">{t('clients.title')}</h2>
                <Button onClick={() => {
                    setShowForm(!showForm);
                    setEditingId(null);
                    setFormData({ dni: '', nombres: '', apellidos: '', ingresos: '', carga_familiar: 0 });
                }}>
                    <Plus className="mr-2 h-4 w-4" /> {t('clients.add_client')}
                </Button>
            </div>

            {showForm && (
                <Card className="animate-in zoom-in-95 duration-300">
                    <CardHeader>
                        <CardTitle>{editingId ? t('clients.edit_client') : t('clients.new_client')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dni" className="flex items-center gap-2">
                                        {t('clients.dni')}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="h-4 w-4 text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{t('clients.dni_tooltip')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </Label>
                                    <Input
                                        id="dni"
                                        value={formData.dni}
                                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nombres">{t('clients.names')}</Label>
                                    <Input
                                        id="nombres"
                                        value={formData.nombres}
                                        onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellidos">{t('clients.surnames')}</Label>
                                    <Input
                                        id="apellidos"
                                        value={formData.apellidos}
                                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ingresos" className="flex items-center gap-2">
                                        {t('clients.income')}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="h-4 w-4 text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{t('clients.income_tooltip')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </Label>
                                    <Input
                                        id="ingresos"
                                        type="number"
                                        value={formData.ingresos}
                                        onChange={(e) => setFormData({ ...formData, ingresos: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="carga_familiar">{t('clients.family_load')}</Label>
                                    <Input
                                        id="carga_familiar"
                                        type="number"
                                        value={formData.carga_familiar}
                                        onChange={(e) => setFormData({ ...formData, carga_familiar: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    {t('clients.cancel')}
                                </Button>
                                <Button type="submit">{t('clients.save')}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase">
                        <tr>
                            <th className="px-6 py-3">{t('clients.dni')}</th>
                            <th className="px-6 py-3">{t('clients.names')}</th>
                            <th className="px-6 py-3">{t('clients.surnames')}</th>
                            <th className="px-6 py-3">{t('clients.income')}</th>
                            <th className="px-6 py-3">{t('clients.family_load')}</th>
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
                        ) : clients.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    {t('clients.no_clients')}
                                </td>
                            </tr>
                        ) : clients.map((client) => (
                            <tr key={client._id}>
                                <td className="px-6 py-4 font-medium">{client.dni}</td>
                                <td className="px-6 py-4">{client.nombres}</td>
                                <td className="px-6 py-4">{client.apellidos}</td>
                                <td className="px-6 py-4">S/ {client.perfil_socioeconomico.ingresos.$numberDecimal}</td>
                                <td className="px-6 py-4">{client.perfil_socioeconomico.carga_familiar}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(client._id)}>
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

export default Clients;
