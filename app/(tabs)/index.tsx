import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import Login from "@/app/Login";

export default function HomeScreen() {
    const router = useRouter();

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Bienvenue dans laccueil</Text>
            <Button
                title="Aller au login"
                onPress={() => router.push('/Login')}
            />
        </View>

    );
}