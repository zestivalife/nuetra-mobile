import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export const SignInScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.form}>
          <TextField
            label="Email Address"
            placeholder="Enter your email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Password"
            placeholder="Enter password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <PrimaryButton title="Sign In" onPress={() => navigation.navigate('SyncWearable')} />

          <View style={styles.footerLine}>
            <Text style={styles.helper}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.link}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  form: {
    gap: 16
  },
  footerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  helper: {
    ...typography.caption,
    color: colors.textSecondary
  },
  link: {
    ...typography.caption,
    color: colors.pink
  }
});
