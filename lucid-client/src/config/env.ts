const requiredEnvVars = [
    'RAPHINA_AI_PRIVATE_KEY',
    'RAPHINA_KEY_FOR_ENCRYPTING_DATA',
    'VALIDATOR_ADDRESS'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
}

export const env = {
    RAPHINA_AI_PRIVATE_KEY: process.env.RAPHINA_AI_PRIVATE_KEY!,
    RAPHINA_KEY_FOR_ENCRYPTING_DATA: process.env.RAPHINA_KEY_FOR_ENCRYPTING_DATA!,
    VALIDATOR_ADDRESS: process.env.VALIDATOR_ADDRESS!
};