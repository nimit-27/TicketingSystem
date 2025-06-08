import Typesense from 'typesense';

const tsClient = new Typesense.Client({
    nodes: [
        {
            host: 'localhost',
            port: 8108,
            protocol: 'http',
        }
    ],
    apiKey: 'xyz123',
    connectionTimeoutSeconds: 2,
});

export default tsClient;