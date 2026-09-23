// Garantías del canal realtime (ARQ-009/ARQ-010, §8 "cero solicitudes solapadas"):
// - Sin solapamiento: con un fetcher más lento que el intervalo, nunca hay
//   dos peticiones en vuelo.
// - Cancelación al detener: stop() aborta la petición en curso.
// - refreshNow() dispara un ciclo inmediato sin esperar el intervalo.
import { describe, expect, it, vi } from 'vitest';
import { useRealtimeChannel } from '../useRealtimeChannel.js';

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

describe('useRealtimeChannel', () => {
    it('no solapa peticiones aunque el fetcher sea más lento que el intervalo', async () => {
        let concurrentes = 0;
        let maxConcurrentes = 0;
        let llamadas = 0;
        const canal = useRealtimeChannel(
            async () => {
                llamadas += 1;
                concurrentes += 1;
                maxConcurrentes = Math.max(maxConcurrentes, concurrentes);
                await esperar(60);
                concurrentes -= 1;
            },
            { intervalMs: 10 }
        );
        canal.start();
        await esperar(170);
        canal.stop();
        expect(llamadas).toBeGreaterThan(0);
        expect(maxConcurrentes).toBe(1);
    });

    it('stop() aborta la petición en curso', async () => {
        let senal = null;
        const canal = useRealtimeChannel(
            async (signal) => {
                senal = signal;
                await esperar(200);
            },
            { intervalMs: 10 }
        );
        canal.start();
        await esperar(30);
        canal.stop();
        expect(senal).not.toBeNull();
        expect(senal.aborted).toBe(true);
    });

    it('refreshNow() adelanta el ciclo sin esperar el intervalo', async () => {
        let llamadas = 0;
        const canal = useRealtimeChannel(
            async () => {
                llamadas += 1;
                await esperar(5);
            },
            { intervalMs: 5000 }
        );
        canal.start();
        await esperar(30);
        const antes = llamadas;
        canal.refreshNow();
        await esperar(30);
        canal.stop();
        // start() dispara el tick inmediato (1) y refreshNow() el segundo (2).
        expect(antes).toBe(1);
        expect(llamadas).toBe(2);
    });

    it('stop() detiene el ciclo: no hay más llamadas', async () => {
        const espia = vi.fn(async () => {});
        const canal = useRealtimeChannel(espia, { intervalMs: 10 });
        canal.start();
        await esperar(35);
        canal.stop();
        const total = espia.mock.calls.length;
        await esperar(40);
        expect(espia.mock.calls.length).toBe(total);
    });
});
