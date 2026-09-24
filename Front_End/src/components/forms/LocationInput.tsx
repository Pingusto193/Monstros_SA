import { LocateFixed, MapPinned, X } from 'lucide-react';
import { useId } from 'react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { SightingLocation } from '@/types';
import { formatCoordinates, formatNumber } from '@/utils/format';
import type { FieldErrors } from '@/utils/validation';
import { LIMITS } from '@/utils/validation';
import styles from './LocationInput.module.css';

type LocationField = 'place' | 'city' | 'region' | 'country';

const COUNTRY_SUGGESTIONS = ['Estados Unidos', 'Canadá', 'Brasil', 'México', 'Argentina', 'Chile', 'Portugal'];

interface LocationInputProps {
  value: SightingLocation;
  /** Recebe só o que mudou — o pai mescla com o estado atual. */
  onChange: (patch: Partial<SightingLocation>) => void;
  errors: FieldErrors<LocationField>;
  disabled?: boolean;
}

export function LocationInput({ value, onChange, errors, disabled = false }: LocationInputProps) {
  const geolocation = useGeolocation();
  const countryListId = useId();

  async function captureCoordinates() {
    const coordinates = await geolocation.request();
    if (coordinates) onChange({ coordinates });
  }

  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      <legend className={styles.legend}>Localização</legend>

      <TextField
        label="Local"
        name="place"
        placeholder="Ex.: Trilha Wonderland, perto do lago Mowich"
        value={value.place}
        onChange={(event) => onChange({ place: event.target.value })}
        error={errors.place}
        maxLength={LIMITS.placeMax}
        autoComplete="off"
        hint="Trilha, parque, lago ou ponto de referência."
      />

      <div className={styles.row}>
        <TextField
          label="Cidade"
          name="city"
          placeholder="Ex.: Ashford"
          value={value.city}
          onChange={(event) => onChange({ city: event.target.value })}
          error={errors.city}
          maxLength={LIMITS.cityMax}
          autoComplete="address-level2"
        />
        <TextField
          label="Estado / região"
          name="region"
          placeholder="Ex.: Washington"
          value={value.region}
          onChange={(event) => onChange({ region: event.target.value })}
          error={errors.region}
          maxLength={LIMITS.regionMax}
          autoComplete="address-level1"
        />
      </div>

      <TextField
        label="País"
        name="country"
        placeholder="Ex.: Estados Unidos"
        value={value.country}
        onChange={(event) => onChange({ country: event.target.value })}
        error={errors.country}
        maxLength={LIMITS.countryMax}
        autoComplete="country-name"
        list={countryListId}
      />
      <datalist id={countryListId}>
        {COUNTRY_SUGGESTIONS.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </datalist>

      <div className={styles.gps}>
        {value.coordinates ? (
          <div className={styles.coordinates}>
            <MapPinned size={18} aria-hidden="true" />
            <div className={styles.coordinatesText}>
              <span className={styles.coordinatesValue}>{formatCoordinates(value.coordinates)}</span>
              {value.coordinates.accuracy !== null && (
                <span className={styles.coordinatesHint}>
                  Precisão de ±{formatNumber(value.coordinates.accuracy)} m
                </span>
              )}
            </div>
            <button
              type="button"
              className={styles.removeCoordinates}
              onClick={() => onChange({ coordinates: null })}
              aria-label="Remover coordenadas GPS"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            icon={<LocateFixed size={16} />}
            loading={geolocation.status === 'loading'}
            loadingText="Obtendo localização…"
            onClick={captureCoordinates}
          >
            Usar minha localização atual
          </Button>
        )}
        <p className={geolocation.error ? styles.gpsError : styles.gpsHint} role={geolocation.error ? 'alert' : undefined}>
          {geolocation.error ??
            'Salva as coordenadas GPS do ponto. Em breve: cidade e estado preenchidos automaticamente.'}
        </p>
      </div>
    </fieldset>
  );
}
