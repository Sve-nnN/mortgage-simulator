import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Properties from '../../pages/Properties';
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

describe('Properties Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        render(
            <I18nextProvider i18n={i18n}>
                <Properties />
            </I18nextProvider>
        );
    };

    it('renders properties list', async () => {
        api.get.mockResolvedValue({ data: [] });
        renderComponent();
        expect(screen.getByText(/Properties/i)).toBeInTheDocument();
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/properties'));
    });

    it('opens add property modal', async () => {
        api.get.mockResolvedValue({ data: [] });
        renderComponent();
        const addButton = screen.getByText(/Add Property/i);
        fireEvent.click(addButton);
        expect(screen.getByText(/New Property/i)).toBeInTheDocument();
    });
});
