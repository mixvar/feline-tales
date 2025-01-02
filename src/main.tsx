import '@fontsource/alex-brush/400.css';
import '@fontsource/spectral/400.css';
import '@fontsource/spectral/500.css';
import '@fontsource/spectral/600.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './core/App.tsx';
import { I18nProvider } from './core/contexts/i18n-context.tsx';
import { LocaleContextProvider } from './core/contexts/locale-context.tsx';
import './index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LocaleContextProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </LocaleContextProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
