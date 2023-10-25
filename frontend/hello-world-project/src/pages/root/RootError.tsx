import { useRouteError } from "react-router-dom";

const RootError = () => {
    const error = useRouteError()
    console.error(error)
    return (
    <div>
        <h1>An Error Occurred!</h1>
    </div>
    )
}


export default RootError;