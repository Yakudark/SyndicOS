import { Orbitron_400Regular, Orbitron_700Bold } from '@expo-google-fonts/orbitron';
import * as Font from 'expo-font';

export const loadFonts = () => {
    return Font.loadAsync({
        Orbitron: Orbitron_400Regular,
        'Orbitron-Bold': Orbitron_700Bold,
    });
};
