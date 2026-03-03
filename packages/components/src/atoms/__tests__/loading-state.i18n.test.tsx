import React from 'react';
import {render, screen} from '@testing-library/react-native';
import i18n from '@/lib/i18n';
import {LoadingState} from '../loading-state';

jest.mock('expo-localization');
jest.mock('expo-secure-store');

describe('LoadingState i18n integration', () => {
    beforeEach(async () => {
        const {initI18n} = require('@/lib/i18n');
        await initI18n();
    });

    afterEach(async () => {
        await i18n.changeLanguage('en');
    });

    it('should use the translation key common.loading', () => {
        render(<LoadingState/>);
        expect(screen.getByText('Loading...')).toBeTruthy();
    });

    it('should render an ActivityIndicator', () => {
        const {UNSAFE_getByType} = render(<LoadingState/>);
        const {ActivityIndicator} = require('react-native');
        expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('should not contain hardcoded English strings when language is Romanian', async () => {
        await i18n.changeLanguage('ro');
        const {queryByText} = render(<LoadingState/>);
        expect(queryByText('Loading...')).toBeNull();
    });

    it('should render Romanian translation when language is ro', async () => {
        await i18n.changeLanguage('ro');
        render(<LoadingState/>);
        expect(screen.getByText('Se încarcă...')).toBeTruthy();
    });

    it('should switch from English to Romanian dynamically', async () => {
        const {queryByText, rerender} = render(<LoadingState/>);
        expect(queryByText('Loading...')).toBeTruthy();

        await i18n.changeLanguage('ro');
        rerender(<LoadingState/>);

        expect(queryByText('Loading...')).toBeNull();
        expect(queryByText('Se încarcă...')).toBeTruthy();
    });

    it('should switch from Romanian back to English', async () => {
        await i18n.changeLanguage('ro');
        const {queryByText, rerender} = render(<LoadingState/>);
        expect(queryByText('Se încarcă...')).toBeTruthy();

        await i18n.changeLanguage('en');
        rerender(<LoadingState/>);

        expect(queryByText('Loading...')).toBeTruthy();
    });

    it('should fall back to English for unsupported language', async () => {
        await i18n.changeLanguage('fr');
        render(<LoadingState/>);
        expect(screen.getByText('Loading...')).toBeTruthy();
    });
});
