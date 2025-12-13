import Constants from 'expo-constants';
import { Alert, Linking } from 'react-native';

const REPO_URL = "https://api.github.com/repos/{YOUR_GITHUB_USERNAME}/munchkin-tracker/releases/latest";
const GITHUB_PAGE = "https://github.com/{YOUR_GITHUB_USERNAME}/munchkin-tracker/releases";

export const checkForUpdates = async (manual = false) => {
    try {
        const response = await fetch(REPO_URL);
        if (!response.ok) {
            if (manual) Alert.alert("Error", "Could not check for updates.");
            return;
        }
        const data = await response.json();
        const latestVersion = data.tag_name?.replace('v', '');
        const currentVersion = Constants.expoConfig?.version || '1.0.0';

        if (latestVersion !== currentVersion) {
            Alert.alert(
                "Update Available",
                `New version ${latestVersion} is available.`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Download", onPress: () => Linking.openURL(GITHUB_PAGE) }
                ]
            );
        } else {
            if (manual) Alert.alert("Up to Date", "You are on the latest version.");
        }
    } catch (e) {
        if (manual) Alert.alert("Error", "Network error checking updates.");
    }
};
