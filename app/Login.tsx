import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://192.168.1.202:8080/auth/login', {
                username,
                password
            });

            const token = response.data.token;
            await AsyncStorage.setItem('jwt', token);

            router.replace('/Patients');
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = "Erreur de connexion";

            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || error.message;
            }

            Alert.alert('Erreur', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Connexion</Text>

            <TextInput
                placeholder="Nom d'utilisateur"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            <Button
                title={loading ? "Connexion en cours..." : "Se connecter"}
                onPress={handleLogin}
                disabled={loading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        justifyContent: 'center'
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
        padding: 12,
        borderRadius: 5,
        fontSize: 16
    }
});