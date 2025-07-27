import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type CustomButtonProps = {
    title: string;
    onPress: () => void;
    backgroundColor?: string;
};

const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, backgroundColor }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.button, { backgroundColor: backgroundColor || '#007bff' }]}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default CustomButton;
