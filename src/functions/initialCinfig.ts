import axios from "axios";

const data = {
    locationId: 1234321,
    sublocationId: 432234,
    sublocationName: ""
}

const getInitialConfig = async () => {
    try {
        await fetch("/test")
    } catch (error) {
        console.log(error)
    }
}