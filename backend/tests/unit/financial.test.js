import { calculateTEM, calculateIndicators } from '../../services/financial.service.js';
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
    });

    describe('calculateIndicators', () => {
        it('should calculate TCEA and TIR correctly', () => {
            // Mock flow: Loan of 1000, 12 payments of 100
            // This is just to test the math, not the schedule generation
            const loan = 1000;
            const payment = 100;
            const flow = [loan, ...Array(12).fill(-payment)];

            const indicators = calculateIndicators(flow, loan);

            expect(indicators).toHaveProperty('tcea');
            expect(indicators).toHaveProperty('tir');
            expect(parseFloat(indicators.tir)).toBeGreaterThan(0);
        });
    });
});
