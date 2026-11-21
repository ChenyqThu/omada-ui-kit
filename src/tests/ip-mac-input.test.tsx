import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  SIpInput,
  SMacInput,
  normalizeMac,
  parseIpValue,
  validateCidr,
  validateIpv4,
  validateMac,
} from '@/omada';

describe('SIpInput & IP validators', () => {
  it('validates IPv4 and CIDR strings accurately', () => {
    expect(validateIpv4('192.168.10.25')).toBe(true);
    expect(validateIpv4('255.255.255.0')).toBe(true);
    expect(validateIpv4('256.1.1.1')).toBe(false);
    expect(validateIpv4('192.168.1')).toBe(false);

    expect(validateCidr('10.0.0.0/24')).toBe(true);
    expect(validateCidr('10.0.0.0/32')).toBe(true);
    expect(validateCidr('10.0.0.0/33')).toBe(false);
    expect(validateCidr('10.0.0.0')).toBe(false);
  });

  it('parses and clamps pasted IPv4/CIDR string in SIpInput', () => {
    const onChange = vi.fn();
    render(<SIpInput mode="cidr" onChange={onChange} />);

    const octet1 = screen.getByLabelText('Octet 1');
    fireEvent.paste(octet1, {
      clipboardData: {
        getData: () => '192.168.10.25/24',
      },
    });

    expect(onChange).toHaveBeenCalledWith('192.168.10.25/24');
    expect((screen.getByLabelText('Octet 1') as HTMLInputElement).value).toBe('192');
    expect((screen.getByLabelText('Octet 2') as HTMLInputElement).value).toBe('168');
    expect((screen.getByLabelText('Octet 3') as HTMLInputElement).value).toBe('10');
    expect((screen.getByLabelText('Octet 4') as HTMLInputElement).value).toBe('25');
    expect((screen.getByLabelText('Subnet mask') as HTMLInputElement).value).toBe('24');
  });

  it('clamps out-of-range octet values above 255', () => {
    const onChange = vi.fn();
    render(<SIpInput mode="ip" defaultValue="10.0.0.1" onChange={onChange} />);

    const octet2 = screen.getByLabelText('Octet 2');
    fireEvent.change(octet2, { target: { value: '999' } });

    expect(onChange).toHaveBeenCalledWith('10.255.0.1');
    expect(parseIpValue('300.168.1.999/64', 'cidr')).toEqual({
      octets: ['255', '168', '1', '255'],
      extra: '32',
    });
  });
});

describe('SMacInput & MAC validators', () => {
  it('validates and normalizes MAC addresses', () => {
    expect(validateMac('00-FF-00-05-3E-FC')).toBe(true);
    expect(validateMac('aa:bb:cc:dd:ee:ff')).toBe(true);
    expect(validateMac('aa:bb:cc:dd:ee')).toBe(false);
    expect(validateMac('GG-FF-00-05-3E-FC')).toBe(false);

    expect(normalizeMac('aa:bb:cc:dd:ee:ff', '-')).toBe('AA-BB-CC-DD-EE-FF');
    expect(normalizeMac('aabbccddeeff', ':')).toBe('AA:BB:CC:DD:EE:FF');
  });

  it('formats pasted colon-separated MAC into uppercase hyphenated value and filters non-hex chars', () => {
    const onChange = vi.fn();
    render(<SMacInput onChange={onChange} />);

    const pair1 = screen.getByLabelText('MAC pair 1');
    fireEvent.paste(pair1, {
      clipboardData: {
        getData: () => 'aa:bb:cc:dd:ee:ff',
      },
    });

    expect(onChange).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF');
    expect((screen.getByLabelText('MAC pair 1') as HTMLInputElement).value).toBe('AA');
    expect((screen.getByLabelText('MAC pair 6') as HTMLInputElement).value).toBe('FF');

    fireEvent.change(pair1, { target: { value: 'z1g' } });
    expect((screen.getByLabelText('MAC pair 1') as HTMLInputElement).value).toBe('1');
  });
});
