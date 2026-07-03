import * as Notifications from "expo-notifications";

export const DEFAULT_SOUND = "notification_sound.wav";

export async function sendNotification({
  title,
  body,
  data,
}: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: DEFAULT_SOUND,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });
}

export async function configureNotifications() {
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    sound: DEFAULT_SOUND,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
}