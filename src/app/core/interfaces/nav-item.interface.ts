export interface NavItem {
    text: string;
    icon: 'home' | 'library' | 'plus' | 'heart';
    route: string;
    queryParams?: { [key: string]: string };
    disabled?: boolean;
}
