type Value = undefined | string | [string, undefined | boolean]
export default function classnames(...values: Value[]) {
    let classname = ""

    for (let value of values) {
        if (!value) continue;

        if (Array.isArray(value)) {
            let [v, bool] = value;
            if (bool) value = v;
        }

        if (typeof value === "string") {
            classname += " " + value;
        }
    }

    return classname
}