import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { theme } from './color';

const STORAGE_WORKING_KEY = "@working";
const STORAGE_TODOS_KEY = "@toDos";

export default function App() {
  useEffect(() => { load() }, []);

  const [modalVisible, setModalVisible] = useState(false);
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({});
  const [objectKey, setObjectKey] = useState(0);

  const travel = async () => {
    try {
      setWorking(false);
      const menu = { "menu": false };
      await AsyncStorage.setItem(STORAGE_WORKING_KEY, JSON.stringify(menu));
    }
    catch (e) {
      console.log(e);
    }
  };

  const work = async () => {
    try {
      setWorking(true);
      const menu = { "menu": true };
      await AsyncStorage.setItem(STORAGE_WORKING_KEY, JSON.stringify(menu));
    }
    catch (e) {
      console.log(e);
    }
  };

  const onChangeText = (payload) => setText(payload);

  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_TODOS_KEY, JSON.stringify(toSave));
      console.log(toSave);
    }
    catch (e) {
      console.log(e);
    }
  };

  const load = async () => {
    try {
      const toDo = await AsyncStorage.getItem(STORAGE_TODOS_KEY);
      setToDos(JSON.parse(toDo));
      const workingBoolean = await AsyncStorage.getItem(STORAGE_WORKING_KEY);
      if (workingBoolean !== null) setWorking(JSON.parse(workingBoolean).menu);
    }
    catch (e) {
      console.log(e);
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return
    }
    const newToDos = { ...toDos, [Date.now()]: { text, working, editing: false } };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const deleteToDo = async (key) => {
    Alert.alert(
      "Delete To Do",
      "Are you sure?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          style: "destructive", // iOS Only
          onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
            console.log(newToDos);
          }
        }
      ]
    );
  };

  const finishToDo = async (key, finish, finishDate) => {
    Alert.alert(
      "Finish To Do",
      "It will be change to completed status",
      [
        { text: "Cancel" },
        {
          text: "Confirm",
          onPress: () => {
            const newToDos = { ...toDos[key], finish, finishDate };
            const assignToDos = Object.assign({ ...toDos, [key]: newToDos });
            setToDos(assignToDos);
            saveToDos(assignToDos);
          }
        }
      ]
    );
  };

  const editChangeText = (payload) => setEditText(payload);

  const editSubmitToDo = async () => {
    if (editText === "") {
      return
    }
    console.log(objectKey);
    const newToDos = { ...toDos[objectKey], text: editText, editing: false };
    const assignToDos = Object.assign({ ...toDos, [objectKey]: newToDos });
    setToDos(assignToDos);
    await saveToDos(assignToDos);
    setEditText("");
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? "white" : theme.grey }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        value={text}
        returnKeyType="done"
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      />
      {
        Object.keys(toDos).length !== 0 ?
          <ScrollView style={{ marginTop: 25 }}>
            {Object.keys(toDos).map(key => (
              toDos[key].working === working ? (
                <View style={styles.toDo} key={key}>
                  <Text style={{ ...styles.toDoText, color: toDos[key].finish ? theme.grey : "white", textDecorationLine: toDos[key].finish ? 'line-through' : null }}>{toDos[key].text}</Text>
                  <View style={styles.iconsView}>
                    <TouchableOpacity style={{ ...styles.icon, display: toDos[key].finish ? 'none' : null }} onPress={() => { setObjectKey(key); setModalVisible(true); }}>
                      <FontAwesome name="pencil" size={18} color={theme.grey} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ ...styles.icon, display: toDos[key].finish ? 'none' : null }} onPress={() => finishToDo(key, true, Date.now())}>
                      <FontAwesome5 name="check" size={18} color={theme.grey} />
                    </TouchableOpacity>
                    {
                      toDos[key].finish ?
                        <Text style={{ ...styles.toDoText, color: theme.grey }}>{String(new Date(toDos[key].finishDate).getFullYear()).substring(2, 4)}.{new Date(toDos[key].finishDate).getMonth() + 1}.{new Date(toDos[key].finishDate).getDate()}</Text> :
                        null
                    }
                    <TouchableOpacity style={styles.icon} onPress={() => deleteToDo(key)}>
                      <Fontisto name="trash" size={18} color={theme.grey} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null
            ))}
          </ScrollView> :
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: theme.grey, fontSize: 21 }}>{working ? "Here is Nothing :(" : "Good Travel makes Good Mind!"}</Text>
          </View>
      }
      <Modal
        animationType="none"
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
        transparent={true}
      >
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={{ color: "black", fontSize: 23, textAlign: "center" }}>{working ? "Rename your To Do" : "Replace your place"}</Text>
            <TextInput
              style={styles.modalTextInput}
              onChangeText={editChangeText}
              onSubmitEditing={editSubmitToDo}
              returnKeyType="done"
            />
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ fontSize: 18, marginHorizontal: 15 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={editSubmitToDo}>
                <Text style={{ fontSize: 18, marginHorizontal: 15 }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 25,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  iconsView: {
    flexDirection: "row",
    justifyContent: "center",
  },
  icon: {
    paddingLeft: 15,
  },
  editInput: {
    flex: 1,
    backgroundColor: "white",
    fontSize: 16,
    borderRadius: 5,
    paddingHorizontal: 5,
  },
  modalView: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(0, 0, 0, 0.8)"
  },
  modalContent: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 15
  },
  modalTextInput: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 21,
    color: theme.grey,
    borderBottomColor: 'black',
    borderBottomWidth: 1
  }
});
