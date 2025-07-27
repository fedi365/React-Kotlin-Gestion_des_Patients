import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Text,
    TextInput,
    View,
    Button,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://192.168.1.202:8080/patients';

type Patient = {
    id: number;
    nom: string;
    prenom: string;
    cin: string;
    codeAssure: string;
};

type UserRole = 'ROLE_USER' | 'ROLE_ADMIN'; // Adaptez selon ce que renvoie votre backend

type JwtPayload = {
    sub: string;
    roles: UserRole[];
    exp: number;
    iat: number;
    // autres champs du token...
};

export default function PatientsScreen() {
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [cin, setCin] = useState('');
    const [codeAssure, setCodeAssure] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTokenAndRole = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('jwt');
                setToken(storedToken);

                if (storedToken) {
                    try {
                        const decoded = jwtDecode<JwtPayload>(storedToken);
                        // Supposons que le premier rôle dans le tableau est le rôle principal
                        const role = decoded.roles[0];
                        setUserRole(role);
                        await fetchPatients(storedToken);
                    } catch (decodeError) {
                        console.error('Erreur de décodage du token:', decodeError);
                        Alert.alert('Erreur', 'Problème d\'authentification');
                    }
                }
            } catch (error) {
                console.error('Erreur de chargement du token:', error);
                Alert.alert('Erreur', 'Impossible de charger les données');
            } finally {
                setIsLoading(false);
            }
        };

        loadTokenAndRole();
    }, []);

    const fetchPatients = async (authToken: string) => {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setPatients(data);
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Erreur', "Impossible de charger les patients");
        }
    };

    const addPatient = async () => {
        if (!nom || !prenom || !cin || !codeAssure) {
            Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
            return;
        }

        if (!token) {
            Alert.alert('Erreur', 'Authentification requise');
            return;
        }

        const newPatient = { nom, prenom, cin, codeAssure };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPatient),
            });

            if (response.ok) {
                Alert.alert('Succès', 'Patient ajouté avec succès !');
                setNom('');
                setPrenom('');
                setCin('');
                setCodeAssure('');
                fetchPatients(token);
            } else {
                const errorData = await response.json();
                Alert.alert('Erreur', errorData.message || "Échec de l'ajout du patient.");
            }
        } catch (error) {
            console.error("Erreur d'ajout:", error);
            Alert.alert('Erreur', "Une erreur est survenue lors de l'ajout du patient.");
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('jwt');
            setToken(null);
            setUserRole(null);
            setPatients([]);
            Alert.alert('Déconnexion', 'Vous avez été déconnecté avec succès');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            Alert.alert('Erreur', 'Problème lors de la déconnexion');
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={styles.loadingText}>Chargement en cours...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>👨‍⚕️ Liste des Patients</Text>

                {token ? (
                    <>
                        <FlatList
                            data={patients}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.itemContainer}>
                                    <Text style={styles.itemTitle}>{item.nom} {item.prenom}</Text>
                                    <Text style={styles.itemDetail}>CIN : {item.cin}</Text>
                                    <Text style={styles.itemDetail}>Code assuré : {item.codeAssure}</Text>
                                </View>
                            )}
                            style={styles.list}
                            ListEmptyComponent={<Text style={styles.emptyText}>Aucun patient trouvé.</Text>}
                        />

                        {/* Afficher le formulaire seulement pour les ADMIN */}
                        {userRole === 'ROLE_ADMIN' && (
                            <>
                                <Text style={styles.subtitle}>➕ Ajouter un patient</Text>
                                <View style={styles.form}>
                                    <TextInput
                                        placeholder="Nom"
                                        style={styles.input}
                                        value={nom}
                                        onChangeText={setNom}
                                        autoCapitalize="words"
                                    />
                                    <TextInput
                                        placeholder="Prénom"
                                        style={styles.input}
                                        value={prenom}
                                        onChangeText={setPrenom}
                                        autoCapitalize="words"
                                    />
                                    <TextInput
                                        placeholder="CIN"
                                        style={styles.input}
                                        value={cin}
                                        onChangeText={setCin}
                                        keyboardType="default"
                                    />
                                    <TextInput
                                        placeholder="Code Assuré"
                                        style={styles.input}
                                        value={codeAssure}
                                        onChangeText={setCodeAssure}
                                        keyboardType="default"
                                    />
                                    <View style={styles.button}>
                                        <Button
                                            title="Ajouter le patient"
                                            onPress={addPatient}
                                            color="#007AFF"
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                        <View style={styles.logoutButton}>
                            <Button
                                title="Déconnexion"
                                onPress={handleLogout}
                                color="#D9534F"
                            />
                        </View>
                    </>
                ) : (
                    <View style={styles.authContainer}>
                        <Text style={styles.errorText}>
                            Veuillez vous connecter pour accéder à cette fonctionnalité
                        </Text>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#555',
    },
    authContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
        color: '#2c3e50',
    },
    list: {
        marginBottom: 30,
    },
    itemContainer: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    itemTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
        color: '#34495e',
    },
    itemDetail: {
        fontSize: 15,
        color: '#7f8c8d',
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        marginVertical: 20,
        fontStyle: 'italic',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
        color: '#2c3e50',
    },
    form: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 12,
        backgroundColor: '#FAFAFA',
    },
    button: {
        marginVertical: 10,
    },
    logoutButton: {
        marginTop: 10,
    },
    errorText: {
        textAlign: 'center',
        color: '#e74c3c',
        fontSize: 16,
        marginTop: 40,
    },
});