/**
 * Financial Service Module
 * Provides functions for calculating mortgage-related financial metrics
 * 
 * @author Juan Carlos Angulo
 * @module services/financial.service
 */

import Decimal from 'decimal.js';

Decimal.set({ precision: 20 });

/**
 * Calculates the Monthly Effective Rate (TEM) from an annual rate
 * 
 * @param {number} rate - Annual rate as percentage (e.g., 10 for 10%)
 * @param {string} rateType - Type of rate: 'Nominal' or 'Efectiva'
 * @param {string} [capitalization='Mensual'] - Capitalization period: 'Mensual' or 'Diaria'
 * @returns {Decimal} Monthly effective rate as decimal
 * @throws {Error} If rate value is invalid
 * 
 * @example
 * // TEA 10% to TEM
 * const tem = calculateTEM(10, 'Efectiva', 'Mensual');
 * 
 * @example
 * // TNA 12% with daily capitalization
 * const tem = calculateTEM(12, 'Nominal', 'Diaria');
 */
export const calculateTEM = (rate, rateType, capitalization = 'Mensual') => {
    if (rate === undefined || rate === null || rate === '') {
        throw new Error('Invalid rate value');
    }
    const r = new Decimal(rate).div(100);

    if (rateType === 'Nominal') {
        if (capitalization === 'Diaria') {
            const j = r.div(360);
            return j.plus(1).pow(30).minus(1);
        } else {
            return r.div(12);
        }
    } else {
        return r.plus(1).pow(new Decimal(1).div(12)).minus(1);
    }
};

/**
 * Generates a detailed amortization schedule using the French method
 * 
 * @param {Object} params - Parameters for schedule generation
 * @param {number} params.monto_prestamo - Loan amount
 * @param {number} params.tasa_interes - Monthly effective rate (TEM) as decimal
 * @param {number} params.plazo_meses - Loan term in months
 * @param {string} params.tipo_gracia - Grace period type: 'Sin Gracia', 'Total', or 'Parcial'
 * @param {number} [params.periodo_gracia_meses=0] - Grace period duration in months
 * @param {Date} [params.fecha_inicio=new Date()] - Start date
 * @param {number} [params.seguro_desgravamen_percent=0] - Credit life insurance rate (monthly %)
 * @param {number} [params.seguro_riesgo_percent=0] - Property insurance rate (monthly %)
 * @param {boolean} [params.bono_buen_pagador=false] - Enable good payer bonus
 * @param {number} [params.bono_buen_pagador_meses=12] - Months with bonus discount
 * @param {number} [params.bono_buen_pagador_percent=0.5] - Bonus discount percentage
 * @returns {Array<Object>} Array of payment records with amortization details
 * 
 * @example
 * const schedule = generateSchedule({
 *   monto_prestamo: 100000,
 *   tasa_interes: 0.00797,
 *   plazo_meses: 120,
 *   tipo_gracia: 'Sin Gracia',
 *   bono_buen_pagador: true,
 *   bono_buen_pagador_meses: 12
 * });
 */
export const generateSchedule = (params) => {
    const {
        monto_prestamo,
        tasa_interes,
        plazo_meses,
        tipo_gracia,
        periodo_gracia_meses,
        fecha_inicio = new Date(),
        seguro_desgravamen_percent = 0,
        seguro_riesgo_percent = 0,
        bono_buen_pagador = false,
        bono_buen_pagador_meses = 12,
        bono_buen_pagador_percent = 0.5,
    } = params;

    let saldo = new Decimal(monto_prestamo);
    const tem = new Decimal(tasa_interes);
    const n = parseInt(plazo_meses);
    const gracePeriod = parseInt(periodo_gracia_meses || 0);
    const desgravamenRate = new Decimal(seguro_desgravamen_percent).div(100);
    const riesgoRate = new Decimal(seguro_riesgo_percent).div(100);

    const schedule = [];
    let currentDate = new Date(fecha_inicio);

    for (let i = 1; i <= n; i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);

        const interes = saldo.times(tem);
        const seguroDesgravamen = saldo.times(desgravamenRate);
        const seguroRiesgo = new Decimal(monto_prestamo).times(riesgoRate);

        let amortizacion = new Decimal(0);
        let cuota = new Decimal(0);
        let cuotaTotal = new Decimal(0);

        if (i <= gracePeriod) {
            if (tipo_gracia === 'Total') {
                amortizacion = new Decimal(0);
                cuota = new Decimal(0);
                saldo = saldo.plus(interes);
            } else if (tipo_gracia === 'Parcial') {
                amortizacion = new Decimal(0);
                cuota = interes;
            }
        } else {
            const remainingN = n - i + 1;
            const factor = tem.plus(1).pow(remainingN);
            cuota = saldo.times(tem.times(factor)).div(factor.minus(1));

            amortizacion = cuota.minus(interes);
            saldo = saldo.minus(amortizacion);
        }

        let bonoBuenPagador = new Decimal(0);
        if (bono_buen_pagador && i <= bono_buen_pagador_meses && cuota.gt(0)) {
            bonoBuenPagador = cuota.times(new Decimal(bono_buen_pagador_percent).div(100));
            cuota = cuota.minus(bonoBuenPagador);
        }

        cuotaTotal = cuota.plus(seguroDesgravamen).plus(seguroRiesgo);

        schedule.push({
            nro_cuota: i,
            fecha: new Date(currentDate),
            amortizacion: amortizacion.toFixed(2),
            interes: interes.toFixed(2),
            cuota_total: cuotaTotal.toFixed(2),
            saldo_final: saldo.toFixed(2),
            seguro_desgravamen: seguroDesgravamen.toFixed(2),
            seguro_riesgo: seguroRiesgo.toFixed(2),
            bono_buen_pagador: bonoBuenPagador.toFixed(2),
        });
    }

    return schedule;
};

/**
 * Calculates financial indicators including TCEA, TIR (IRR), and VAN (NPV)
 * 
 * @param {number[]} flow - Array of cash flows (positive for inflows, negative for outflows)
 * @param {number} [cok_annual=0] - Annual Cost of Opportunity Capital (COK) as percentage
 * @returns {Object} Financial indicators
 * @returns {string} return.tcea - Total Effective Annual Cost (%)
 * @returns {string} return.tir - Internal Rate of Return (%)
 * @returns {string} return.van - Net Present Value using COK
 * 
 * @example
 * const flow = [99000, -1200, -1200, ...]; // Loan - costs, then payments
 * const indicators = calculateIndicators(flow, 10); // 10% annual COK
 * // Returns: { tcea: "15.23", tir: "1.19", van: "-5432.10" }
 */
export const calculateIndicators = (flow, cok_annual = 0) => {
    const calculateIRR = (values, guess = 0.1) => {
        const maxIter = 1000;
        const tol = 1e-6;
        let rate = guess;

        for (let i = 0; i < maxIter; i++) {
            let fValue = 0;
            let fDerivative = 0;
            for (let j = 0; j < values.length; j++) {
                fValue += values[j] / Math.pow(1 + rate, j);
                fDerivative += -j * values[j] / Math.pow(1 + rate, j + 1);
            }
            const newRate = rate - fValue / fDerivative;
            if (Math.abs(newRate - rate) < tol) return newRate;
            rate = newRate;
        }
        return rate;
    };

    const irr = calculateIRR(flow);
    const tcea = (Math.pow(1 + irr, 12) - 1) * 100;

    const cok_monthly = Math.pow(1 + (cok_annual / 100), 1/12) - 1;
    
    let van = 0;
    for (let i = 0; i < flow.length; i++) {
        van += flow[i] / Math.pow(1 + cok_monthly, i);
    }

    return {
        tcea: tcea.toFixed(2),
        tir: (irr * 100).toFixed(2),
        van: van.toFixed(2),
    };
};
