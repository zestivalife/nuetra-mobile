import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppLogo } from '../../components/AppLogo';
import { Screen } from '../../components/Screen';
import { RootStackParamList } from '../../navigation/types';
import { useAppContext } from '../../state/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen = ({ navigation }: Props) => {
  const { onboarding } = useAppContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onboarding) {
        navigation.replace('Main');
        return;
      }
      navigation.replace('OnboardingBasics');
    }, 900);

    return () => clearTimeout(timer);
  }, [navigation, onboarding]);

  return (
    <Screen>
      <View style={styles.container}>
        <AppLogo width={88} height={80} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
