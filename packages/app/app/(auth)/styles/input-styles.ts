import {Colors} from '@yuhuu/components';

export const getInputStyles = (scheme: 'light' | 'dark') => ({
  container: {
    borderWidth: 1,
    borderColor: scheme === 'dark' ? '#2A2A2A' : '#ccc',
    borderRadius: 8,
    padding: 12,
    color: Colors[scheme].text,
    backgroundColor: scheme === 'dark' ? '#1F2937' : '#fff',
  } as const,
  placeholderColor: scheme === 'dark' ? '#9CA3AF' : '#6B7280',
  selectionColor: Colors[scheme].tint,
});

export const buttonStyles = {
  primary: {
    backgroundColor: '#1e90ff',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 50,
  },
  text: {
    color: '#ffffff',
    fontWeight: '700' as const,
    fontSize: 17,
    textAlign: 'center' as const,
  },
};
