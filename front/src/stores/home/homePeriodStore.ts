import { persist } from 'zustand/middleware';
import { TimePeriod } from '~/models/enums/TimePeriod';
import { createResettableStore } from '~/stores/createResettableStore';

type HomePeriodState = {
    timePeriod: TimePeriod;
};

type HomePeriodAction = {
    setTimePeriod: (timePeriod: TimePeriod) => void;
};

export const useHomePeriodStore = createResettableStore<HomePeriodState & HomePeriodAction>()(
    persist(
        (set) => ({
            timePeriod: TimePeriod.Last7Days,
            setTimePeriod: (timePeriod) => set({ timePeriod }),
        }),
        {
            name: 'app:home:period',
        }
    )
);
