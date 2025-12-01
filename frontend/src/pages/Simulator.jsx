import { useState, useEffect } from 'react';
import api from '../services/api';
import { Save, Calculator as CalcIcon, Info } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/Tooltip';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const Simulator = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const simulationId = searchParams.get('id');

    const [step, setStep] = useState(1);
    const [clients, setClients] = useState([]);
    const [properties, setProperties] = useState([]);

    const [selectedClient, setSelectedClient] = useState('');
    const [selectedProperty, setSelectedProperty] = useState('');

    const [params, setParams] = useState({
        moneda: 'PEN',
        monto_prestamo: '',
        tasa_valor: '',
        tasa_tipo: 'Efectiva',
        capitalizacion: 'Mensual',
        plazo_meses: 120,
        tipo_gracia: 'Sin Gracia',
        periodo_gracia_meses: 0,
        bono_buen_pagador: false,
        bono_buen_pagador_meses: 12,
        bono_buen_pagador_percent: 0.5,
        seguro_desgravamen_percent: 0.05,
        seguro_riesgo_percent: 0.03,
        cok_percent: 10,
        costos_adicionales: [],
    });

    const [showCostForm, setShowCostForm] = useState(false);
    const [newCost, setNewCost] = useState({
        nombre: '',
        tipo: 'fijo',
        valor: '',
        base: 'monto_prestamo',
    });

    const [results, setResults] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cRes, pRes] = await Promise.all([
                    api.get('/clients'),
                    api.get('/properties'),
                ]);
                setClients(cRes.data);
                setProperties(pRes.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    // Effect to load simulation data if ID exists
    useEffect(() => {
        const loadSimulation = async () => {
            if (!simulationId) return;
            try {
                const { data } = await api.get(`/simulate/${simulationId}`);

                setSelectedClient(data.client_id._id || data.client_id);

                // Helper to safely get decimal value
                const getDecimal = (val) => val && val.$numberDecimal ? parseFloat(val.$numberDecimal) : parseFloat(val);

                setParams({
                    moneda: data.input_data.moneda || 'PEN',
                    monto_prestamo: getDecimal(data.input_data.monto_prestamo),
                    tasa_valor: getDecimal(data.input_data.tasa_valor) || '',
                    tasa_tipo: data.input_data.tasa_tipo || 'Efectiva',
                    capitalizacion: data.input_data.capitalizacion || 'Mensual',
                    plazo_meses: data.input_data.plazo_meses,
                    tipo_gracia: data.input_data.tipo_gracia,
                    periodo_gracia_meses: data.input_data.periodo_gracia_meses,
                    bono_buen_pagador: data.input_data.bono_buen_pagador,
                    seguro_desgravamen_percent: 0.05,
                    seguro_riesgo_percent: 0.03,
                });

                setResults({
                    indicators: {
                        van: getDecimal(data.output_summary.van),
                        tir: getDecimal(data.output_summary.tir),
                        tcea: getDecimal(data.output_summary.tcea),
                    },
                    schedule: data.cronograma.map(row => ({
                        ...row,
                        amortizacion: getDecimal(row.amortizacion),
                        interes: getDecimal(row.interes),
                        cuota_total: getDecimal(row.cuota_total),
                        saldo_final: getDecimal(row.saldo_final),
                        seguro_desgravamen: getDecimal(row.seguro_desgravamen),
                        seguro_riesgo: getDecimal(row.seguro_riesgo),
                    })),
                    tem: getDecimal(data.input_data.tasa_interes)
                });
                setStep(3); // Jump to results
            } catch (error) {
                console.error("Error loading simulation", error);
                toast.error(t('simulator.error_loading'));
            }
        };
        loadSimulation();
    }, [simulationId, t]);

    const handleCalculate = async () => {
        try {
            const property = properties.find(p => p._id === selectedProperty);
            const payload = {
                ...params,
                valor_propiedad: property?.valor_venta?.$numberDecimal || params.monto_prestamo,
            };
            const { data } = await api.post('/simulate/calculate', payload);
            setResults(data);
            setStep(3);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || t('simulator.error_calculating'));
        }
    };

    const handleSave = async () => {
        try {
            const client = clients.find(c => c._id === selectedClient);
            const property = properties.find(p => p._id === selectedProperty);

            const payload = {
                client_id: selectedClient,
                property_snapshot: {
                    codigo: property?.codigo || 'N/A',
                    direccion: property?.direccion || 'N/A',
                    valor_venta: property?.valor_venta?.$numberDecimal || 0,
                    estado: property?.estado || 'N/A',
                },
                input_data: {
                    moneda: params.moneda,
                    monto_prestamo: params.monto_prestamo,
                    tasa_interes: results.tem, // Saving TEM used
                    tasa_valor: params.tasa_valor,
                    tasa_tipo: params.tasa_tipo,
                    capitalizacion: params.capitalizacion,
                    plazo_meses: params.plazo_meses,
                    tipo_gracia: params.tipo_gracia,
                    periodo_gracia_meses: params.periodo_gracia_meses,
                    bono_buen_pagador: params.bono_buen_pagador,
                    bono_buen_pagador_meses: params.bono_buen_pagador_meses,
                    bono_buen_pagador_percent: params.bono_buen_pagador_percent,
                    cok_percent: params.cok_percent,
                    costos_adicionales: params.costos_adicionales,
                },
                output_summary: results.indicators,
                cronograma: results.schedule,
            };

            await api.post('/simulate/save', payload);
            toast.success(t('simulator.success_saved'));
        } catch (error) {
            console.error(error);
            toast.error(t('simulator.error_saving'));
        }
    };

    const currencySymbol = params.moneda === 'USD' ? '$' : 'S/';

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">{t('simulator.title')}</h2>

            {/* Stepper */}
            <div className="flex items-center justify-center mb-8">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
                <div className={`h-1 w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
                <div className={`h-1 w-16 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
            </div>

            {step === 1 && (
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>{t('simulator.step1_title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="client-select">{t('simulator.client')}</Label>
                            <select
                                id="client-select"
                                value={selectedClient}
                                onChange={(e) => setSelectedClient(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="">{t('simulator.select_client')}</option>
                                {clients.map(c => (
                                    <option key={c._id} value={c._id}>{c.nombres} {c.apellidos} - {c.dni}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="property-select">{t('simulator.property')}</Label>
                            <select
                                id="property-select"
                                value={selectedProperty}
                                onChange={(e) => {
                                    setSelectedProperty(e.target.value);
                                    const prop = properties.find(p => p._id === e.target.value);
                                    if (prop) {
                                        setParams({
                                            ...params,
                                            monto_prestamo: prop.valor_venta.$numberDecimal,
                                            moneda: prop.moneda || 'PEN'
                                        });
                                    }
                                }}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="">{t('simulator.select_property')}</option>
                                {properties.map(p => (
                                    <option key={p._id} value={p._id}>{p.direccion} - {p.moneda === 'USD' ? '$' : 'S/'} {p.valor_venta.$numberDecimal}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button
                                disabled={!selectedClient || !selectedProperty}
                                onClick={() => setStep(2)}
                            >
                                {t('simulator.next')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 2 && (
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>{t('simulator.step2_title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="currency-select" className="flex items-center gap-2">
                                    {t('simulator.currency')}
                                </Label>
                                <select
                                    id="currency-select"
                                    value={params.moneda}
                                    onChange={(e) => setParams({ ...params, moneda: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="PEN">Soles (PEN)</option>
                                    <option value="USD">Dólares (USD)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="loan-amount-input" className="flex items-center gap-2">
                                    {t('simulator.loan_amount')} ({currencySymbol})
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger><Info className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                                            <TooltipContent><p>{t('simulator.loan_amount_tooltip')}</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <Input
                                    id="loan-amount-input"
                                    type="number"
                                    value={params.monto_prestamo}
                                    onChange={(e) => setParams({ ...params, monto_prestamo: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="term-input" className="flex items-center gap-2">
                                    {t('simulator.term')}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger><Info className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                                            <TooltipContent><p>{t('simulator.term_tooltip')}</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <Input
                                    id="term-input"
                                    type="number"
                                    value={params.plazo_meses}
                                    onChange={(e) => setParams({ ...params, plazo_meses: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rate-value-input" className="flex items-center gap-2">
                                    {t('simulator.rate_value')}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger><Info className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                                            <TooltipContent><p>{t('simulator.rate_value_tooltip')}</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <Input
                                    id="rate-value-input"
                                    type="number"
                                    value={params.tasa_valor}
                                    onChange={(e) => setParams({ ...params, tasa_valor: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rate-type-select">{t('simulator.rate_type')}</Label>
                                <select
                                    id="rate-type-select"
                                    value={params.tasa_tipo}
                                    onChange={(e) => setParams({ ...params, tasa_tipo: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="Efectiva">Efectiva (TEA)</option>
                                    <option value="Nominal">Nominal (TNA)</option>
                                </select>
                            </div>
                            {params.tasa_tipo === 'Nominal' && (
                                <div className="space-y-2">
                                    <Label htmlFor="capitalization-select">{t('simulator.capitalization')}</Label>
                                    <select
                                        id="capitalization-select"
                                        value={params.capitalizacion}
                                        onChange={(e) => setParams({ ...params, capitalizacion: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="Mensual">Mensual</option>
                                        <option value="Diaria">Diaria</option>
                                    </select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="grace-type-select">{t('simulator.grace_type')}</Label>
                                <select
                                    id="grace-type-select"
                                    value={params.tipo_gracia}
                                    onChange={(e) => setParams({ ...params, tipo_gracia: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="Sin Gracia">Sin Gracia</option>
                                    <option value="Total">Total</option>
                                    <option value="Parcial">Parcial</option>
                                </select>
                            </div>
                            {params.tipo_gracia !== 'Sin Gracia' && (
                                <div className="space-y-2">
                                    <Label htmlFor="grace-period-input">{t('simulator.grace_period')}</Label>
                                    <Input
                                        id="grace-period-input"
                                        type="number"
                                        value={params.periodo_gracia_meses}
                                        onChange={(e) => setParams({ ...params, periodo_gracia_meses: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="cok-input" className="flex items-center gap-2">
                                    COK - Costo de Oportunidad (%)
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger><Info className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                                            <TooltipContent><p>Tasa anual de descuento para calcular el VAN</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <Input
                                    id="cok-input"
                                    type="number"
                                    step="0.01"
                                    value={params.cok_percent}
                                    onChange={(e) => setParams({ ...params, cok_percent: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="bono-check"
                                        checked={params.bono_buen_pagador}
                                        onChange={(e) => setParams({ ...params, bono_buen_pagador: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="bono-check" className="flex items-center gap-2">
                                        Bono del Buen Pagador
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger><Info className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                                                <TooltipContent><p>Descuento por pago puntual en los primeros meses</p></TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </Label>
                                </div>
                            </div>
                            {params.bono_buen_pagador && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="bono-meses">Meses de aplicacion</Label>
                                        <Input
                                            id="bono-meses"
                                            type="number"
                                            value={params.bono_buen_pagador_meses}
                                            onChange={(e) => setParams({ ...params, bono_buen_pagador_meses: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bono-percent">Descuento (%)</Label>
                                        <Input
                                            id="bono-percent"
                                            type="number"
                                            step="0.01"
                                            value={params.bono_buen_pagador_percent}
                                            onChange={(e) => setParams({ ...params, bono_buen_pagador_percent: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Additional Costs Section */}
                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Costos Adicionales</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCostForm(!showCostForm)}
                                >
                                    {showCostForm ? 'Cancelar' : '+ Agregar Costo'}
                                </Button>
                            </div>

                            {showCostForm && (
                                <Card className="mb-4 bg-gray-50">
                                    <CardContent className="pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cost-name">Nombre del Costo</Label>
                                                <Input
                                                    id="cost-name"
                                                    value={newCost.nombre}
                                                    onChange={(e) => setNewCost({ ...newCost, nombre: e.target.value })}
                                                    placeholder="Ej: Gastos notariales"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cost-type">Tipo</Label>
                                                <select
                                                    id="cost-type"
                                                    value={newCost.tipo}
                                                    onChange={(e) => setNewCost({ ...newCost, tipo: e.target.value })}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                >
                                                    <option value="fijo">Monto Fijo</option>
                                                    <option value="porcentaje">Porcentaje</option>
                                                </select>
                                            </div>
                                            {newCost.tipo === 'porcentaje' && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="cost-base">Base de Calculo</Label>
                                                    <select
                                                        id="cost-base"
                                                        value={newCost.base}
                                                        onChange={(e) => setNewCost({ ...newCost, base: e.target.value })}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    >
                                                        <option value="monto_prestamo">Monto del Prestamo</option>
                                                        <option value="valor_propiedad">Valor de la Propiedad</option>
                                                    </select>
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <Label htmlFor="cost-value">
                                                    {newCost.tipo === 'fijo' ? `Monto (${currencySymbol})` : 'Porcentaje (%)'}
                                                </Label>
                                                <Input
                                                    id="cost-value"
                                                    type="number"
                                                    step="0.01"
                                                    value={newCost.valor}
                                                    onChange={(e) => setNewCost({ ...newCost, valor: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    if (newCost.nombre && newCost.valor) {
                                                        setParams({
                                                            ...params,
                                                            costos_adicionales: [...params.costos_adicionales, { ...newCost }]
                                                        });
                                                        setNewCost({ nombre: '', tipo: 'fijo', valor: '', base: 'monto_prestamo' });
                                                        setShowCostForm(false);
                                                    }
                                                }}
                                            >
                                                Agregar
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {params.costos_adicionales.length > 0 && (
                                <div className="space-y-2">
                                    {params.costos_adicionales.map((costo, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                            <div>
                                                <span className="font-medium">{costo.nombre}</span>
                                                <span className="text-sm text-gray-600 ml-2">
                                                    {costo.tipo === 'fijo'
                                                        ? `${currencySymbol} ${costo.valor}`
                                                        : `${costo.valor}% de ${costo.base === 'monto_prestamo' ? 'Prestamo' : 'Propiedad'}`
                                                    }
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const newCostos = params.costos_adicionales.filter((_, i) => i !== index);
                                                    setParams({ ...params, costos_adicionales: newCostos });
                                                }}
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                {t('simulator.back')}
                            </Button>
                            <Button onClick={handleCalculate} className="flex items-center gap-2">
                                <CalcIcon size={18} />
                                {t('simulator.calculate')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 3 && results && (
                <div className="space-y-6">
                    {/* Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-6">
                                <h4 className="text-gray-500 text-sm">{t('simulator.tem')}</h4>
                                <p className="text-2xl font-bold">{(results.tem * 100).toFixed(4)}%</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="pt-6">
                                <h4 className="text-gray-500 text-sm">{t('simulator.tcea')}</h4>
                                <p className="text-2xl font-bold">{results.indicators.tcea}%</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-purple-500">
                            <CardContent className="pt-6">
                                <h4 className="text-gray-500 text-sm">{t('simulator.tir')}</h4>
                                <p className="text-2xl font-bold">{results.indicators.tir}%</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-orange-500">
                            <CardContent className="pt-6">
                                <h4 className="text-gray-500 text-sm">VAN</h4>
                                <p className="text-2xl font-bold">{currencySymbol} {parseFloat(results.indicators.van).toFixed(2)}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Initial Costs Summary */}
                    {results.costos_iniciales_total && parseFloat(results.costos_iniciales_total) > 0 && (
                        <Card className="bg-yellow-50 border-yellow-200">
                            <CardContent className="pt-6">
                                <h4 className="text-lg font-semibold mb-2">Costos Iniciales</h4>
                                <p className="text-2xl font-bold text-yellow-800">
                                    {currencySymbol} {parseFloat(results.costos_iniciales_total).toFixed(2)}
                                </p>
                                {params.costos_adicionales.length > 0 && (
                                    <div className="mt-4 space-y-1">
                                        {params.costos_adicionales.map((costo, idx) => (
                                            <div key={idx} className="text-sm text-gray-700">
                                                <span className="font-medium">{costo.nombre}:</span>{' '}
                                                {costo.tipo === 'fijo'
                                                    ? `${currencySymbol} ${costo.valor}`
                                                    : `${costo.valor}% de ${costo.base === 'monto_prestamo' ? 'Prestamo' : 'Propiedad'}`
                                                }
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Schedule Table */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{t('simulator.schedule')}</CardTitle>
                            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                                <Save className="mr-2 h-4 w-4" />
                                {t('simulator.save')}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-4 py-3">#</th>
                                            <th className="px-4 py-3">{t('simulator.date')}</th>
                                            <th className="px-4 py-3">{t('simulator.interest')}</th>
                                            <th className="px-4 py-3">{t('simulator.amortization')}</th>
                                            <th className="px-4 py-3">{t('simulator.insurance')}</th>
                                            {params.bono_buen_pagador && <th className="px-4 py-3">Bono</th>}
                                            <th className="px-4 py-3">{t('simulator.total_payment')}</th>
                                            <th className="px-4 py-3">{t('simulator.balance')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {results.schedule.map((row) => (
                                            <tr key={row.nro_cuota}>
                                                <td className="px-4 py-2">{row.nro_cuota}</td>
                                                <td className="px-4 py-2">{new Date(row.fecha).toLocaleDateString()}</td>
                                                <td className="px-4 py-2">{currencySymbol} {parseFloat(row.interes).toFixed(2)}</td>
                                                <td className="px-4 py-2">{currencySymbol} {parseFloat(row.amortizacion).toFixed(2)}</td>
                                                <td className="px-4 py-2">
                                                    {currencySymbol} {(
                                                        parseFloat(row.seguro_desgravamen) +
                                                        parseFloat(row.seguro_riesgo)
                                                    ).toFixed(2)}
                                                </td>
                                                {params.bono_buen_pagador && (
                                                    <td className="px-4 py-2 text-green-600">
                                                        {row.bono_buen_pagador && parseFloat(row.bono_buen_pagador) > 0
                                                            ? `-${currencySymbol} ${parseFloat(row.bono_buen_pagador).toFixed(2)}`
                                                            : '-'
                                                        }
                                                    </td>
                                                )}
                                                <td className="px-4 py-2 font-bold">{currencySymbol} {parseFloat(row.cuota_total).toFixed(2)}</td>
                                                <td className="px-4 py-2">{currencySymbol} {parseFloat(row.saldo_final).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-start">
                        <Button variant="ghost" onClick={() => setStep(2)}>
                            {t('simulator.back_config')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Simulator;
