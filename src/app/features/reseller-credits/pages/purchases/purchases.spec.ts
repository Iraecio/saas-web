import { describe, expect, it } from 'vitest';
import { paymentInstructionItems, validatePaymentProof } from './purchases';

describe('credit purchase payment instructions', () => {
  it('shows PIX key, key type and instructions', () => {
    const items = paymentInstructionItems({
      pixKey: 'financeiro@example.com',
      pixKeyType: 'EMAIL',
      instructions: 'Envie o comprovante após o pagamento.',
    });

    expect(items).toEqual([
      {
        key: 'pixKey',
        label: 'Chave PIX',
        value: 'financeiro@example.com',
        wide: true,
      },
      { key: 'pixKeyType', label: 'Tipo da chave PIX', value: 'EMAIL', wide: false },
      {
        key: 'instructions',
        label: 'Instruções',
        value: 'Envie o comprovante após o pagamento.',
        wide: true,
      },
    ]);
  });

  it('shows provider copy-and-paste payment data when available', () => {
    const items = paymentInstructionItems({ qrCodeCopyPaste: '000201010212...' });

    expect(items).toContainEqual({
      key: 'qrCodeCopyPaste',
      label: 'PIX copia e cola',
      value: '000201010212...',
      wide: true,
    });
  });

  it.each(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'])(
    'accepts a payment proof with MIME type %s',
    (type) => {
      const file = new File(['proof'], 'proof', { type });
      expect(validatePaymentProof(file)).toBeNull();
    },
  );

  it('rejects an unsupported payment proof format', () => {
    const file = new File(['content'], 'proof.txt', { type: 'text/plain' });
    expect(validatePaymentProof(file)).toContain('Formato inválido');
  });

  it('rejects a payment proof larger than 10 MB', () => {
    const file = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'proof.jpg', {
      type: 'image/jpeg',
    });
    expect(validatePaymentProof(file)).toContain('10 MB');
  });
});
