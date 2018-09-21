const basicRequStru = {
    cache: 'no-cache',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    mode: 'same-origin',
};

module.exports = {
    doValidate: false,
    fetchRequestConfigs(method: string = 'get', body: any) {
        let preAppended = Object.assign(
            {
                method: method,
            },
            basicRequStru
        );

        if (body)
            preAppended.body = JSON.stringify(payload);

        return preAppended;
    },
};