import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Clients from '../../pages/Clients';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18nForTests';
import api from '../../services/api';

// Mock API
vi.mock('../../services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock Toaster
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('Clients Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        render(
            <I18nextProvider i18n={i18n}>
                <Clients />
            </I18nextProvider>
        );
    };

    it('renders clients list', async () => {
        api.get.mockResolvedValue({ data: [] });
        renderComponent();
        expect(screen.getByText(/Clients/i)).toBeInTheDocument();
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/clients'));
    });

    it('opens add client modal', async () => {
        api.get.mockResolvedValue({ data: [] });
        renderComponent();
        const addButton = screen.getByRole('button', { name: /Add Client/i });
        fireEvent.click(addButton);
        expect(screen.getByText(/New Client/i)).toBeInTheDocument();
    });
});
