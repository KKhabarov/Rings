# 📱 Rings — Геолокационный мессенджер

Rings — это мобильный мессенджер, который соединяет людей не по списку контактов, а по реальному местоположению. Чат существует в каждой точке планеты — ты не создаёшь его и не вступаешь в него. Ты просто находишься здесь — и чат тоже здесь.

Подробнее о концепции: [docs/concept.md](docs/concept.md)

---

## 🚀 Установка и запуск

```bash
# Установить зависимости
npm install

# Скопировать переменные окружения
cp .env.example .env
# Заполнить .env своими значениями

# Запустить Expo
npx expo start
```

Для запуска на устройстве:
- **Android:** `npm run android`
- **iOS:** `npm run ios`
- **Web:** `npm run web`

---

## 📁 Структура проекта

```
/
├── app/                        # Expo Router (зарезервировано)
├── src/
│   ├── components/             # Переиспользуемые UI-компоненты
│   │   └── ui/                 # Базовые UI-элементы
│   ├── screens/                # Экраны приложения
│   │   ├── MapScreen.tsx       # Основной экран с картой
│   │   ├── ChatScreen.tsx      # Экран чата
│   │   ├── ProfileScreen.tsx   # Экран профиля
│   │   └── AuthScreen.tsx      # Экран авторизации
│   ├── services/               # Внешние сервисы
│   │   └── supabase.ts         # Supabase клиент
│   ├── hooks/                  # Кастомные хуки
│   ├── utils/                  # Утилиты
│   ├── types/                  # TypeScript типы
│   │   └── index.ts
│   ├── constants/              # Константы
│   │   └── theme.ts            # Тема приложения
│   ├── i18n/                   # Интернационализация
│   │   ├── index.ts
│   │   ├── ru.json
│   │   └── en.json
│   └── store/                  # Стейт-менеджмент
├── docs/
│   └── concept.md              # Концепт-документ
├── supabase/
│   └── migrations/             # Миграции БД
├── .env.example
├── .gitignore
├── app.json
├── tsconfig.json
└── package.json
```

---

## 🛠 Стек технологий

| Технология | Назначение |
|---|---|
| React Native (Expo) + TypeScript | Мобильное приложение |
| Google Maps (`react-native-maps`) | Карты |
| Supabase (PostgreSQL + PostGIS) | База данных, аутентификация, realtime |
| Supabase Realtime | WebSocket-чаты |
| `expo-location` | Геолокация и geofencing |
| `expo-notifications` + FCM | Пуш-уведомления |
| `i18next` + `react-i18next` | Интернационализация (ru/en) |
| React Navigation | Навигация |

---

## 📖 Концепция

[docs/concept.md](docs/concept.md)
