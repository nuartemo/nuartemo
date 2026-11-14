import { useId } from 'react';
export function DateTimeFields({
    label,
    value,
    onChange,
    minDate,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    minDate?: string;
}) {
    const id = useId();
    const [date = '', time = ''] = value.split('T');
    return (
        <fieldset className="date-time-fields">
            <legend>{label}</legend>
            <div className="field-grid">
                <label htmlFor={`${id}-date`}>
                    Data
                    <input
                        id={`${id}-date`}
                        aria-label={`${label}: data`}
                        type="date"
                        value={date}
                        min={minDate}
                        onChange={(event) =>
                            onChange(`${event.target.value}T${time}`)
                        }
                    />
                </label>
                <label htmlFor={`${id}-time`}>
                    Horário
                    <input
                        id={`${id}-time`}
                        aria-label={`${label}: horário`}
                        type="text"
                        inputMode="numeric"
                        placeholder="HH:MM"
                        maxLength={5}
                        value={time.slice(0, 5)}
                        onChange={(event) =>
                            onChange(`${date}T${event.target.value}`)
                        }
                    />
                </label>
            </div>
        </fieldset>
    );
}
