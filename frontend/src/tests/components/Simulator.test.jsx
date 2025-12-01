import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Simulator from '../../pages/Simulator';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18nForTests';

// Mock API
vi.mock('../../services/api', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
    },
}));

// Mock Toaster
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('Simulator Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        render(
            <I18nextProvider i18n={i18n}>
                <BrowserRouter>
                    <Simulator />
                </BrowserRouter>
            </I18nextProvider>
        );
    };

    it('renders simulation form step 1', () => {
        renderComponent();
        expect(screen.getByText(/Mortgage Simulator/i)).toBeInTheDocument();
        expect(screen.getByText(/Select Client & Property/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Client/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Property/i)).toBeInTheDocument();
    });

    it('disables next button if no selection', () => {
        renderComponent();
        const nextButton = screen.getByText(/Next/i);
        expect(nextButton).toBeDisabled();
    });
});
