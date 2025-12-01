import { calculateTEM, calculateIndicators, generateSchedule } from '../../services/financial.service.js';
import Decimal from 'decimal.js';

describe('Financial Service', () => {
    describe('calculateTEM', () => {
        it('should calculate TEM correctly for Effective rate', () => {
            const tem = calculateTEM(10, 'Efectiva', 'Mensual');
            // (1 + 0.1)^(1/12) - 1
            const expected = Math.pow(1.1, 1 / 12) - 1;
            expect(tem.toNumber()).toBeCloseTo(expected, 6);
        });

        it('should calculate TEM correctly for Nominal rate with Monthly capitalization', () => {
            const tem = calculateTEM(12, 'Nominal', 'Mensual');
            // 0.12 / 12
            expect(tem.toNumber()).toBeCloseTo(0.01, 6);
        });

        it('should calculate TEM correctly for Nominal rate with Daily capitalization', () => {
            const tem = calculateTEM(12, 'Nominal', 'Diaria');
            // j = 0.12/360, TEM = (1+j)^30 - 1
            const j = 0.12 / 360;
            const expected = Math.pow(1 + j, 30) - 1;
            expect(tem.toNumber()).toBeCloseTo(expected, 6);
        });

        it('should calculate TEM correctly for different effective rates', () => {
            const tem5 = calculateTEM(5, 'Efectiva', 'Mensual');
            const tem15 = calculateTEM(15, 'Efectiva', 'Mensual');
            const tem20 = calculateTEM(20, 'Efectiva', 'Mensual');

            expect(tem5.toNumber()).toBeCloseTo(Math.pow(1.05, 1/12) - 1, 6);
            expect(tem15.toNumber()).toBeCloseTo(Math.pow(1.15, 1/12) - 1, 6);
            expect(tem20.toNumber()).toBeCloseTo(Math.pow(1.20, 1/12) - 1, 6);
        });

        it('should throw error for invalid rate', () => {
            expect(() => calculateTEM(null, 'Efectiva', 'Mensual')).toThrow('Invalid rate value');
            expect(() => calculateTEM('', 'Efectiva', 'Mensual')).toThrow('Invalid rate value');
            expect(() => calculateTEM(undefined, 'Efectiva', 'Mensual')).toThrow('Invalid rate value');
        });
    });

    describe('calculateIndicators', () => {
        it('should calculate TCEA and TIR correctly', () => {
            // Mock flow: Loan of 1000, 12 payments of 100
            const loan = 1000;
            const payment = 100;
            const flow = [loan, ...Array(12).fill(-payment)];

            const indicators = calculateIndicators(flow, 0);

            expect(indicators).toHaveProperty('tcea');
            expect(indicators).toHaveProperty('tir');
            expect(indicators).toHaveProperty('van');
            expect(parseFloat(indicators.tir)).toBeGreaterThan(0);
        });

        it('should calculate VAN correctly with COK', () => {
            // Simple case: invest 1000, receive 1200 after 12 months
            const flow = [-1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1200];
            const cok_annual = 10; // 10% annual COK

            const indicators = calculateIndicators(flow, cok_annual);
            
            // VAN should be calculated with monthly discount rate
            const cok_monthly = Math.pow(1.1, 1/12) - 1;
            const expectedVAN = -1000 + 1200 / Math.pow(1 + cok_monthly, 12);
            
            expect(parseFloat(indicators.van)).toBeCloseTo(expectedVAN, 2);
        });

        it('should calculate VAN = 0 when COK equals TIR', () => {
            const flow = [1000, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100];
            
            // First calculate TIR
            const indicators1 = calculateIndicators(flow, 0);
            const tirMonthly = parseFloat(indicators1.tir) / 100;
            
            // Convert monthly TIR to annual
            const tirAnnual = (Math.pow(1 + tirMonthly, 12) - 1) * 100;
            
            // Calculate VAN with COK = TIR
            const indicators2 = calculateIndicators(flow, tirAnnual);
            
            // VAN should be close to 0 when COK = TIR
            expect(Math.abs(parseFloat(indicators2.van))).toBeLessThan(1);
        });

        it('should calculate positive VAN when TIR > COK', () => {
            // High return investment
            const flow = [-1000, 200, 200, 200, 200, 200, 200]; // ~14.5% monthly return
            const cok_annual = 5; // Low COK

            const indicators = calculateIndicators(flow, cok_annual);
            
            expect(parseFloat(indicators.van)).toBeGreaterThan(0);
        });

        it('should calculate negative VAN when TIR < COK', () => {
            // Low return investment
            const flow = [-1000, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]; // ~1.5% monthly return
            const cok_annual = 50; // High COK

            const indicators = calculateIndicators(flow, cok_annual);
            
            expect(parseFloat(indicators.van)).toBeLessThan(0);
        });

        it('should handle zero COK correctly', () => {
            const flow = [1000, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100];
            
            const indicators = calculateIndicators(flow, 0);
            
            // VAN with 0% COK is just the sum of flows
            const expectedVAN = flow.reduce((sum, val) => sum + val, 0);
            
            expect(parseFloat(indicators.van)).toBeCloseTo(expectedVAN, 2);
        });
    });

    describe('generateSchedule', () => {
        it('should generate correct schedule for simple French system loan', () => {
            const params = {
                monto_prestamo: 10000,
                tasa_interes: 0.01, // 1% monthly
                plazo_meses: 12,
                tipo_gracia: 'Sin Gracia',
                periodo_gracia_meses: 0,
                seguro_desgravamen_percent: 0,
                seguro_riesgo_percent: 0,
                bono_buen_pagador: false,
            };

            const schedule = generateSchedule(params);

            expect(schedule).toHaveLength(12);
            expect(schedule[0]).toHaveProperty('nro_cuota', 1);
            expect(schedule[0]).toHaveProperty('amortizacion');
            expect(schedule[0]).toHaveProperty('interes');
            expect(schedule[0]).toHaveProperty('cuota_total');
            expect(schedule[0]).toHaveProperty('saldo_final');

            // First payment interest should be approximately monto_prestamo * TEM
            const firstInterest = parseFloat(schedule[0].interes);
            expect(firstInterest).toBeCloseTo(100, 0); // 10000 * 0.01

            // Last payment should have saldo_final close to 0
            const lastSaldo = parseFloat(schedule[11].saldo_final);
            expect(Math.abs(lastSaldo)).toBeLessThan(1);

            // All cuotas should be approximately equal (French system)
            const cuotas = schedule.map(s => parseFloat(s.cuota_total));
            const avgCuota = cuotas.reduce((a, b) => a + b) / cuotas.length;
            cuotas.forEach(cuota => {
                expect(cuota).toBeCloseTo(avgCuota, 0);
            });
        });

        it('should apply Bono del Buen Pagador correctly', () => {
            const params = {
                monto_prestamo: 10000,
                tasa_interes: 0.01,
                plazo_meses: 12,
                tipo_gracia: 'Sin Gracia',
                periodo_gracia_meses: 0,
                seguro_desgravamen_percent: 0,
                seguro_riesgo_percent: 0,
                bono_buen_pagador: true,
                bono_buen_pagador_meses: 6,
                bono_buen_pagador_percent: 0.5, // 0.5% discount
            };

            const schedule = generateSchedule(params);

            // First 6 payments should have bono discount
            for (let i = 0; i < 6; i++) {
                const bono = parseFloat(schedule[i].bono_buen_pagador);
                expect(bono).toBeGreaterThan(0);
                
                // Bono should be approximately 0.5% of the cuota
                const cuotaWithBono = parseFloat(schedule[i].cuota_total) + bono;
                const expectedBono = cuotaWithBono * 0.005;
                expect(bono).toBeCloseTo(expectedBono, 1);
            }

            // Remaining payments should have no bono
            for (let i = 6; i < 12; i++) {
                const bono = parseFloat(schedule[i].bono_buen_pagador);
                expect(bono).toBe(0);
            }
        });

        it('should handle Partial Grace period correctly', () => {
            const params = {
                monto_prestamo: 10000,
                tasa_interes: 0.01,
                plazo_meses: 12,
                tipo_gracia: 'Parcial',
                periodo_gracia_meses: 3,
                seguro_desgravamen_percent: 0,
                seguro_riesgo_percent: 0,
                bono_buen_pagador: false,
            };

            const schedule = generateSchedule(params);

            // First 3 payments should have zero amortization
            for (let i = 0; i < 3; i++) {
                const amort = parseFloat(schedule[i].amortizacion);
                expect(amort).toBe(0);
                
                // Cuota should equal interest only
                const interest = parseFloat(schedule[i].interes);
                const cuota = parseFloat(schedule[i].cuota_total);
                expect(cuota).toBeCloseTo(interest, 2);
            }

            // After grace period, should have normal amortization
            const amort4 = parseFloat(schedule[3].amortizacion);
            expect(amort4).toBeGreaterThan(0);
        });

        it('should handle Total Grace period correctly', () => {
            const params = {
                monto_prestamo: 10000,
                tasa_interes: 0.01,
                plazo_meses: 12,
                tipo_gracia: 'Total',
                periodo_gracia_meses: 3,
                seguro_desgravamen_percent: 0,
                seguro_riesgo_percent: 0,
                bono_buen_pagador: false,
            };

            const schedule = generateSchedule(params);

            // First 3 payments should have zero payment and amortization
            for (let i = 0; i < 3; i++) {
                const amort = parseFloat(schedule[i].amortizacion);
                const cuota = parseFloat(schedule[i].cuota_total);
                expect(amort).toBe(0);
                expect(cuota).toBe(0);
            }

            // Balance should increase during grace period due to capitalized interest
            const saldo0 = 10000;
            const saldo3 = parseFloat(schedule[2].saldo_final);
            expect(saldo3).toBeGreaterThan(saldo0);
            
            // Increase should be approximately compound interest
            const expectedSaldo3 = saldo0 * Math.pow(1.01, 3);
            expect(saldo3).toBeCloseTo(expectedSaldo3, 0);
        });

        it('should apply insurances correctly', () => {
            const params = {
                monto_prestamo: 10000,
                tasa_interes: 0.01,
                plazo_meses: 12,
                tipo_gracia: 'Sin Gracia',
                periodo_gracia_meses: 0,
                seguro_desgravamen_percent: 0.05, // 0.05% monthly on balance
                seguro_riesgo_percent: 0.03, // 0.03% monthly on loan amount
                bono_buen_pagador: false,
            };

            const schedule = generateSchedule(params);

            // First payment insurance calculations
            const firstDesgravamen = parseFloat(schedule[0].seguro_desgravamen);
            const firstRiesgo = parseFloat(schedule[0].seguro_riesgo);
            
            expect(firstDesgravamen).toBeCloseTo(10000 * 0.0005, 2); // 5
            expect(firstRiesgo).toBeCloseTo(10000 * 0.0003, 2); // 3

            // Desgravamen should decrease as balance decreases
            const lastDesgravamen = parseFloat(schedule[11].seguro_desgravamen);
            expect(lastDesgravamen).toBeLessThan(firstDesgravamen);

            // Riesgo should remain constant (based on initial loan)
            const lastRiesgo = parseFloat(schedule[11].seguro_riesgo);
            expect(lastRiesgo).toBeCloseTo(firstRiesgo, 2);
        });

        it('should calculate correct total amount paid', () => {
            const params = {
                monto_prestamo: 10000,
                tasa_interes: 0.015, // 1.5% monthly
                plazo_meses: 24,
                tipo_gracia: 'Sin Gracia',
                periodo_gracia_meses: 0,
                seguro_desgravamen_percent: 0.05,
                seguro_riesgo_percent: 0.03,
                bono_buen_pagador: true,
                bono_buen_pagador_meses: 12,
                bono_buen_pagador_percent: 0.5,
            };

            const schedule = generateSchedule(params);

            // Sum all payments
            const totalPaid = schedule.reduce((sum, payment) => {
                return sum + parseFloat(payment.cuota_total);
            }, 0);

            // Total paid should be greater than loan amount (interest + insurances)
            expect(totalPaid).toBeGreaterThan(10000);

            // Sum of all amortizations should equal loan amount
            const totalAmort = schedule.reduce((sum, payment) => {
                return sum + parseFloat(payment.amortizacion);
            }, 0);
            expect(totalAmort).toBeCloseTo(10000, 0);

            // Sum of all interest should be total paid minus amortization minus insurances minus bonos
            const totalInterest = schedule.reduce((sum, payment) => {
                return sum + parseFloat(payment.interes);
            }, 0);
            const totalDesgravamen = schedule.reduce((sum, payment) => {
                return sum + parseFloat(payment.seguro_desgravamen);
            }, 0);
            const totalRiesgo = schedule.reduce((sum, payment) => {
                return sum + parseFloat(payment.seguro_riesgo);
            }, 0);
            const totalBonos = schedule.reduce((sum, payment) => {
                return sum + parseFloat(payment.bono_buen_pagador);
            }, 0);

            const calculatedTotal = totalAmort + totalInterest + totalDesgravamen + totalRiesgo - totalBonos;
            expect(calculatedTotal).toBeCloseTo(totalPaid, 0);
        });
    });
});
