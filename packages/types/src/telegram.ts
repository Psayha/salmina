/**
 * @file telegram.ts
 * @description Telegram SDK types and WebApp integration types
 * @author AI Assistant
 * @created 2024-11-13
 */

/**
 * Telegram WebApp InitData
 * Represents the initData passed to the web app from Telegram
 * @see https://core.telegram.org/bots/webapps#initializing-web-apps
 */
export interface TelegramInitData {
  /** Unique identifier for the web app session */
  hash: string;
  /** A user object containing information about the user */
  user?: TelegramUser;
  /** An object containing information about the user's Telegram account */
  auth_user?: TelegramUser;
  /** Bot username without @ */
  bot_username?: string;
  /** Unix time when the form was opened */
  auth_date: number;
  /** Can be either queryId or auth_date depending on the context */
  query_id?: string;
}

/**
 * Telegram User object
 * Contains information about a Telegram user
 * @see https://core.telegram.org/bots/webapps#user-object
 */
export interface TelegramUser {
  /** Unique identifier for this user or bot */
  id: number;
  /** True, if this user is a bot */
  is_bot?: boolean;
  /** User's or bot's first name */
  first_name: string;
  /** User's or bot's last name (optional) */
  last_name?: string;
  /** User's or bot's username (optional) */
  username?: string;
  /** IETF language tag of the user's language (optional) */
  language_code?: string;
  /** True, if this user is a Telegram Premium user */
  is_premium?: boolean;
  /** True, if this user added the bot to the attachment menu */
  added_to_attachment_menu?: boolean;
  /** URL of the user's profile photo (optional) */
  photo_url?: string;
  /** True, if the user allowed the bot to send them messages */
  allows_write_to_pm?: boolean;
}

/**
 * Telegram Chat object
 * Contains information about a Telegram chat
 */
export interface TelegramChat {
  /** Unique identifier for this chat */
  id: number;
  /** Type of chat, can be either 'private', 'group', 'supergroup' or 'channel' */
  type: 'private' | 'group' | 'supergroup' | 'channel';
  /** Title, for supergroups, channels and group chats (optional) */
  title?: string;
  /** Username, for private chats, supergroups and channels if available (optional) */
  username?: string;
  /** First name of the other party in a private chat (optional) */
  first_name?: string;
  /** Last name of the other party in a private chat (optional) */
  last_name?: string;
  /** True if the bot can be invited to this chat */
  is_forum?: boolean;
}

/**
 * Telegram WebApp theme parameters
 * Contains theme configuration for WebApp
 */
export interface TelegramThemeParams {
  /** RGB value of the background color in #RRGGBB format */
  bg_color?: string;
  /** RGB value of the text color in #RRGGBB format */
  text_color?: string;
  /** RGB value of the hint text color in #RRGGBB format */
  hint_text_color?: string;
  /** RGB value of the link color in #RRGGBB format */
  link_color?: string;
  /** RGB value of the button color in #RRGGBB format */
  button_color?: string;
  /** RGB value of the button text color in #RRGGBB format */
  button_text_color?: string;
  /** RGB value of the secondary background color in #RRGGBB format */
  secondary_bg_color?: string;
  /** RGB value of the header background color in #RRGGBB format */
  header_bg_color?: string;
  /** RGB value of the accent text color in #RRGGBB format */
  accent_text_color?: string;
  /** RGB value of the section background color in #RRGGBB format */
  section_bg_color?: string;
  /** RGB value of the section header text color in #RRGGBB format */
  section_header_text_color?: string;
  /** RGB value of the subtitle text color in #RRGGBB format */
  subtitle_text_color?: string;
  /** RGB value of the destructive text color in #RRGGBB format */
  destructive_text_color?: string;
}

/**
 * Telegram WebApp viewport change data
 * Sent when viewport height changes
 */
export interface TelegramViewportChangedData {
  /** Height of the visible viewport in pixels */
  height: number;
  /** True if the viewport is expanded to take up most of the available height */
  is_expanded: boolean;
  /** True if the viewport height is being changed in real-time */
  is_state_stable: boolean;
}

/**
 * Telegram WebApp haptic feedback type
 * Defines types of haptic feedback available
 */
export type TelegramHapticFeedbackType =
  | 'impact'
  | 'notification'
  | 'selection';

/**
 * Telegram WebApp impact haptic feedback
 * Parameters for impact haptic feedback
 */
export interface TelegramImpactHapticFeedback {
  /** Type of haptic effect */
  style: 'light' | 'medium' | 'heavy';
}

/**
 * Telegram WebApp notification haptic feedback
 * Parameters for notification haptic feedback
 */
export interface TelegramNotificationHapticFeedback {
  /** Type of notification effect */
  type: 'error' | 'success' | 'warning';
}

/**
 * Telegram WebApp main button configuration
 * Configuration for the main button in WebApp
 */
export interface TelegramMainButton {
  /** Button text */
  text: string;
  /** Button text color (CSS color format) */
  color?: string;
  /** Button background color (CSS color format) */
  text_color?: string;
  /** Whether the button is visible */
  is_visible: boolean;
  /** Whether the button is enabled */
  is_active: boolean;
  /** Whether the button is in progress state */
  is_progress_visible: boolean;
}

/**
 * Telegram WebApp back button configuration
 * Configuration for the back button in WebApp
 */
export interface TelegramBackButton {
  /** Whether the button is visible */
  is_visible: boolean;
}

/**
 * Telegram WebApp popup button
 * Button configuration for popups
 */
export interface TelegramPopupButton {
  /** Button unique ID */
  id: string;
  /** Button text */
  text: string;
  /** Button type: 'default' or 'destructive' */
  type?: 'default' | 'destructive' | 'ok' | 'close' | 'cancel';
}

/**
 * Telegram WebApp popup parameters
 * Parameters for showing a popup/alert
 */
export interface TelegramPopupParams {
  /** Popup title */
  title?: string;
  /** Popup message */
  message: string;
  /** Popup buttons */
  buttons?: TelegramPopupButton[];
}

/**
 * Telegram WebApp context
 * Information about the context in which the WebApp was opened
 */
export interface TelegramWebAppContext {
  /** Unique identifier of the chat where the link was used */
  chat_id?: number;
  /** Unique identifier of the user's chat */
  user_id?: number;
  /** Unique identifier of the chat where the inline query was used */
  chat_instance?: string;
  /** Unique identifier of the inline query */
  chat_type?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel';
}

/**
 * Telegram WebApp instance
 * Main Telegram WebApp API object
 */
export interface TelegramWebApp {
  /** Current Telegram initData */
  initData: string;
  /** Parsed Telegram initData */
  initDataUnsafe: TelegramInitData;
  /** Current theme parameters */
  themeParams: TelegramThemeParams;
  /** Information about the chat where the link was used */
  chatInstance?: string;
  /** Unique session ID */
  sessionStorage: Record<string, string>;
  /** Cloudinary storage */
  cloudStorage: TelegramCloudStorage;
  /** Information about the user */
  user?: TelegramUser;
  /** True if the user opened the app from an attachment menu */
  isFromAttachmentMenu: boolean;
  /** True if the app is running in fullscreen mode */
  isFullscreen: boolean;
  /** True if the app is allowed to be expanded */
  isExpanded: boolean;
  /** Viewport height in pixels */
  viewportHeight: number;
  /** True if the viewport height is being changed in real-time */
  viewportStableHeight: number;
  /** The header color in #RRGGBB format */
  headerColor: string;
  /** The background color in #RRGGBB format */
  backgroundColor: string;
  /** The bottom bar background color in #RRGGBB format */
  bottomBarColor: string;
  /** The main button object */
  MainButton: TelegramMainButton;
  /** The back button object */
  BackButton: TelegramBackButton;
  /** Secondary button object (for some versions) */
  SecondaryButton?: TelegramMainButton;

  // Methods
  ready(): void;
  expand(): void;
  close(): void;
  sendData(data: string | Record<string, unknown>): void;
  switchInlineQuery(
    query: string,
    choose_chat_type?: 'users' | 'bots' | 'groups' | 'channels'
  ): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: string) => void): void;
  shareToStory(media_url: string, text?: string, widget_link?: string): void;
  sharePhone(phone_number: string): void;
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  requestContactAccess(callback?: (granted: boolean) => void): void;
  readTextFromClipboard(callback: (text: string | null) => void): void;
  showPopup(
    params: TelegramPopupParams,
    callback?: (button_id: string | null) => void
  ): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  showScanQrPopup(
    params: { text?: string },
    callback?: (data: string | null) => void
  ): void;
  closeScanQrPopup(): void;
  readQrCodeFromCamera(
    callback: (data: string | null) => void,
    error_callback?: () => void
  ): void;
  onEvent(eventType: string, eventHandler: (...args: unknown[]) => void): void;
  offEvent(eventType: string, eventHandler: (...args: unknown[]) => void): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  setBottomBarColor(color: string): void;
  setHeaderColor(color_key: 'bg_color' | string): void;
  setBackgroundColor(color: string): void;
  hapticFeedback(
    params:
      | { type: 'impact'; style: 'light' | 'medium' | 'heavy' }
      | { type: 'notification'; style: 'error' | 'success' | 'warning' }
      | { type: 'selection' }
  ): void;
  setEmojiStatusAccessToken(token: string, success?: () => void, error?: () => void): void;
  getEmojiStatusAccessUrl(): void;
  checkQrCodeAccessibility(callback: (accessible: boolean) => void): void;
}

/**
 * Telegram Cloud Storage interface
 * For persistent storage using Telegram Cloud Storage
 */
export interface TelegramCloudStorage {
  setItem(
    key: string,
    value: string,
    callback?: (success: boolean, error?: string) => void
  ): void;
  getItem(key: string, callback?: (value: string | null) => void): void;
  getItems(
    keys: string[],
    callback?: (values: Record<string, string | null>) => void
  ): void;
  removeItem(
    key: string,
    callback?: (success: boolean, error?: string) => void
  ): void;
  removeItems(
    keys: string[],
    callback?: (success: boolean, error?: string) => void
  ): void;
  getKeys(callback?: (keys: string[]) => void): void;
  getAllKeys(callback?: (keys: string[]) => void): void;
}

/**
 * Telegram authentication data
 * Safe verified user data from Telegram
 */
export interface TelegramAuthData {
  /** User ID from Telegram */
  userId: bigint;
  /** First name */
  firstName: string;
  /** Last name (optional) */
  lastName?: string;
  /** Username (optional) */
  username?: string;
  /** Language code (optional) */
  languageCode?: string;
  /** Is premium user */
  isPremium: boolean;
  /** Profile photo URL (optional) */
  photoUrl?: string;
  /** Authentication timestamp */
  authDate: Date;
  /** Is authenticated */
  isAuthenticated: boolean;
}
