export interface IWizdomContext {
    appUrl: string;
    blobUrl: string;
    clientId: string;
    wizdomdevelopermode: any;
    isWizdomSaaS: boolean;
    serverContext: {
        allWizdomRoles: string[];
        rolesForCurrentUser: string[];
        currentUserLanguage: string;
    }
} 