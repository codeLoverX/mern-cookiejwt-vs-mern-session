import { useRef, useState } from "react"
import { TodoToggle } from "./TodoToggle";
import { toast } from 'react-toastify';

export const TodoList = ({
    todoList, handleCurrentTodoIndex, removeTodo, editTodo
}) => {
    const ref = useRef([]);
    const [loading, setLoading] = useState(false);
    const deleteData = async (id) => {
        setLoading(true);
        try {
            const response = await window.axios2.delete(`/todo/${id}`)
            await setTimeout(() => {
                setLoading(false);
                toast.success(response.message, {
                    position: toast.POSITION.TOP_RIGHT
                });
                removeTodo(id);
            }, 3000);
        }
        catch (error) {
            if (loading) setLoading(false);
            toast.error(`${error.response?.status || ""} Error: ${error.response?.error || error.message}`)
        }
    }
    const setDone = async (value, id, todo) => {
        setLoading(true);
        try {
            const response = await window.axios2.put(`/todo/${id}`, {
                done: value
            })
            await setTimeout(() => {
                setLoading(false);
                toast.success(response.message, {
                    position: toast.POSITION.TOP_RIGHT
                });
                editTodo({ ...todo, done: value });
            }, 3000);
        } catch (error) {
            if (loading) setLoading(false);
            toast.error(`${error.response?.status || ""} Error: ${error.response?.error || error.message}`)
        }
    }
    const handleRef = (index) => {
        if (ref.current[index].classList.contains("collapse-close"))
            ref.current[index].classList.replace("collapse-close", "collapse-open")
        else
            ref.current[index].classList.replace("collapse-open", "collapse-close")
    }
    return (
        <div className="mt-3 pb-12 text-medium">
            <h3 className='pt-5 pb-3 text-xl font-bold'>Current Todo</h3>
            {todoList.map((value, index) => (
                <div key={value._id}
                    ref={el => ref.current[index] = el}
                    tabIndex={index}
                    className="block collapse collapse-close text-gray-600  border border-base-300 bg-base-100 dark:bg-white rounded-box">
                    <div className="collapse-title flex justify-between">
                        <div className='text-medium pl-5'>
                            <TodoToggle _id={`ref${value._id}`} toggleFunction={() => handleRef(index)} />
                            <input type="checkbox"
                                checked={value.done}
                                className={`checkbox checkbox-primary relative top-1 ml-3 ${loading ? "opacity-40 pointer-events-none" : ""}`}
                                onChange={(event) => {
                                    setDone(event.currentTarget.checked, value._id, value)
                                }}
                            />
                            <span className={`ml-3 font-semibold ${value.done ? "font-normal line-through" : ""}`}>{value.title}</span>
                        </div>
                        <div className={`text-lg ${loading ? "opacity-40 pointer-events-none" : ""}`}
                        >
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                                    className="w-6 h-6 inline text-green-500 cursor-pointer hover:text-blue-500"
                                    onClick={() => { handleCurrentTodoIndex(index); }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                                    className="ml-3 w-6 h-6 inline cursor-pointer text-red-500 hover:text-blue-500"
                                    onClick={() => { deleteData(value._id); }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </>
                        </div>
                    </div>
                    <div className="collapse-content" >
                        <div className='pl-5 text-medium'>
                            {value.description}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
