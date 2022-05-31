import React, {useEffect, useState, useRef, useReducer, useMemo} from "react";
import {useTitle as useDocumentTitle} from "react-use";

import NewTodo from "./NewTodo";
import TodoItem from "./TodoItem";
import {Container, List} from "./Styled";
import About from "./About"

const useTodosWithLocalStore = ( defaultVal ) => {
    const todoId = useRef(0)
    const initVal = () => {
        const valFromStorage = JSON.parse(window.localStorage.getItem('todos') || JSON.stringify(defaultVal))
        todoId.current = valFromStorage.reduce((index, todo) => Math.max(index, todo.id), 0);
        return valFromStorage;
    }
    const [todos, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case "ADD_TODO":
                todoId.current += 1;
                return [...state, {
                    id: todoId.current,
                    text: action.text,
                    completed: false
                }]
            case "DELETE_TODO":
                return state.filter(todo => todo.id !== action.id);
            case "TOGGLE_TODO":
                return state.map(todo =>
                    todo.id === action.id ? {...todo, completed: !todo.completed} : todo
                )
            default:
                return state;
        }
    }, useMemo(initVal, []))
    useEffect(() => {
        window.localStorage.setItem('todos', JSON.stringify(todos));
    }, [todos])
    return [todos, dispatch];
}

/*const useLocalStorageState = (key, defaultVal, callback) => {
    const [storage, setStorage] = useState(() => {
        const valFromStorage = JSON.parse(window.localStorage.getItem(key) || JSON.stringify(defaultVal))
        if (callback) {
            callback(valFromStorage);
        }
        return valFromStorage;
    });
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(storage));
    }, [storage])

    return [storage, setStorage]
}*/

/*const useDocumentTitle = (title) => {
    useEffect(() => {
        document.title = title;
    }, [title])
}*/

const useKeyDown = (map, defaultVal) => {
    const [match, setMatch] = useState(defaultVal);

    useEffect(() => {

        const handleKey = ({key}) => {
            setMatch(preMatch => Object.keys(map).some(k => k === key) ? map[key] : preMatch);
        }

        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("keydown", handleKey);
        }
    }, [])

    return [match, setMatch];
}

export default function TodoList() {
    const [newTodo, updateNewTodo] = useState("");
    // const todoId = useRef(0)
    /*const [todos, updateTodos] = useLocalStorageState('todos', [], (valFromStorage) => {
        todoId.current = valFromStorage.reduce((index, todo) => Math.max(index, todo.id), 0)
    }) */

    const [todos, dispatch] = useTodosWithLocalStore([]);

    const inCompleteTodos = todos?.reduce(
        (memo, todo) => (!todo.completed ? memo + 1 : memo),
        0
    );
    const title = inCompleteTodos ? `Todos (${inCompleteTodos})` : "Todos";
    useDocumentTitle(title);

    const [showAbout, setShowAbout] = useKeyDown({"?": true, Escape: false}, false);

    const handleNewChange = (e) => {
        updateNewTodo(e.target.value);
    }

    const handleNewSubmit = (e) => {
        e.preventDefault();
        dispatch({
            type: "ADD_TODO",
            text: newTodo
        })
        // todoId.current += 1;
        // updateTodos(prevTodos => [...prevTodos, {id: todoId.current, text: newTodo, completed: false}])
        updateNewTodo("")
    }
    const handleDelete = (id, e) => {
        dispatch({
            type: "DELETE_TODO",
            id: id
        })
        // updateTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    }
    const handleCompletedToggle = (id, e) => {
        dispatch({
            type: "DELETE_TODO",
            id: id
        })
        // updateTodos(prevTodos => prevTodos.map(todo =>
        //     todo.id === id ? {...todo, completed: !todo.completed} : todo
        // ));
    }
    return (
        <Container todos={todos}>
            <NewTodo
                onSubmit={handleNewSubmit}
                value={newTodo}
                onChange={handleNewChange}
            />
            {!!todos?.length && (
                <List>
                    {todos.map(todo => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onChange={handleCompletedToggle}
                            onDelete={handleDelete}
                        />
                    ))}
                </List>
            )}
            <About isOpen={showAbout} onClose={() => setShowAbout(false)}/>
        </Container>
    );
}
