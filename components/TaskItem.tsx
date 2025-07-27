import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface Task {
    id: number;
    text: string;
}

interface Props {
    task: Task;
    onDelete: () => void;
}

export default function TaskItem({ task, onDelete }: Props) {
    return (
        <View style={styles.task}>
            <Text>{task.text}</Text>
            <Button title="Supprimer" onPress={onDelete} />
        </View>
    );
}

const styles = StyleSheet.create({
    task: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#eee',
        borderRadius: 5,
    },
});
