import Decimal from 'decimal.js';

// Configure Decimal for high precision
Decimal.set({ precision: 20 });

export const calculateTEM = (rate, rateType, capitalization = 'Mensual') => {
    // rate is percentage, e.g., 10 for 10%
    if (rate === undefined || rate === null || rate === '') {
        throw new Error('Invalid rate value');
    }
    const r = new Decimal(rate).div(100);

    if (rateType === 'Nominal') {
        // Tasa Nominal
        // If capitalization is Diaria, m = 30. If Mensual, m = 1.
        // TEM = (1 + TNA/m)^m - 1 ? No, usually Nominal is annual.
        // Let's assume input is Annual Nominal Rate (TNA).
        // If capitalization is Daily: j = TNA/360. TEM = (1+j)^30 - 1.
        // If capitalization is Monthly: j = TNA/12. TEM = j.

        if (capitalization === 'Diaria') {
            const j = r.div(360);
            return j.plus(1).pow(30).minus(1);
        } else { // Mensual
            return r.div(12);
        }
    } else {
        // Tasa Efectiva
        // Assume input is TEA (Annual Effective Rate).
        // TEM = (1 + TEA)^(1/12) - 1
        return r.plus(1).pow(new Decimal(1).div(12)).minus(1);
    }
};

export const generateSchedule = (params) => {
    const {
        monto_prestamo,
        tasa_interes, // TEM
        plazo_meses,
        tipo_gracia,
        periodo_gracia_meses,
        fecha_inicio = new Date(),
        seguro_desgravamen_percent = 0, // Monthly %
        seguro_riesgo_percent = 0, // Monthly %
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
        // Calculate dates (simplified: +30 days or +1 month)
        currentDate.setMonth(currentDate.getMonth() + 1);

        const interes = saldo.times(tem);
        const seguroDesgravamen = saldo.times(desgravamenRate);
        const seguroRiesgo = new Decimal(monto_prestamo).times(riesgoRate); // Usually on initial amount or property value? Assuming initial amount for simplicity or passed value.
        // Note: Seguro Riesgo usually on Property Value. We'll assume it's passed or calculated on loan for now if property value not available here.
        // Let's stick to loan amount for now or adjust if property value passed.

        let amortizacion = new Decimal(0);
        let cuota = new Decimal(0);
        let cuotaTotal = new Decimal(0);

        if (i <= gracePeriod) {
            if (tipo_gracia === 'Total') {
                // Interest capitalized
                amortizacion = new Decimal(0);
                cuota = new Decimal(0); // No payment
                // Interest adds to balance
                saldo = saldo.plus(interes);
            } else if (tipo_gracia === 'Parcial') {
                // Pay interest only
                amortizacion = new Decimal(0);
                cuota = interes;
                // Balance remains same
            }
        } else {
            // French Method
            // Remaining periods
            const remainingN = n - i + 1;
            // Recalculate R based on current saldo
            // R = P * (i * (1+i)^n) / ((1+i)^n - 1)
            const factor = tem.plus(1).pow(remainingN);
            cuota = saldo.times(tem.times(factor)).div(factor.minus(1));

            amortizacion = cuota.minus(interes);
            saldo = saldo.minus(amortizacion);
        }

        // Adjust last installment for precision
        if (i === n && saldo.abs().gt(0)) {
            // Add remaining dust to amortization/cuota
            // Or just set saldo to 0.
            // Let's adjust amortization to clear saldo.
            // But wait, if we calculated R correctly, it should be close.
            // Let's just force saldo 0 and adjust amort.
            // amortizacion = amortizacion.plus(saldo);
            // cuota = amortizacion.plus(interes);
            // saldo = new Decimal(0);
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
        });
    }

    return schedule;
};

export const calculateIndicators = (flow, initialInvestment) => {
    // VAN, TIR, TCEA
    // Flow is array of net cash flows (negative initial, positive returns? Or for borrower: positive loan, negative payments)
    // For the borrower (Cost):
    // Initial: +Loan - Expenses
    // Flows: -CuotaTotal

    // We need to calculate TCEA (TIR of the flows including all costs)

    // Simple IRR implementation (Newton-Raphson)
    const calculateIRR = (values, guess = 0.1) => {
        // ... implementation ...
        // Using a library or simple approximation
        // Let's use a simple iterative approach
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
    const tcea = (Math.pow(1 + irr, 12) - 1) * 100; // Annualized

    // VAN (NPV) at a discount rate (cok)
    // const van = ...

    return {
        tcea: tcea.toFixed(2),
        tir: (irr * 100).toFixed(2), // Monthly IRR
        van: 0, // Placeholder, need discount rate
    };
};
