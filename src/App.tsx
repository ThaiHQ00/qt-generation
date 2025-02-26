import React, { useState, useRef } from "react"; // Add useRef
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { useLoadScript } from "@react-google-maps/api";
import { QRCodeSVG } from "qrcode.react"; 
import html2canvas from 'html2canvas-pro'; 

export default function Places() {
  return <MapComponent />;
}

interface BusinessDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  type: string;
  hours: string;
}

const qrCodeTemplates = [
  {
    id: 1,
    name: "Default",
    qrColor: "#000000",
    bgColor: "#FFFFFF",
    textColor: "#000000",
    border: "none",
  },
  {
    id: 2,
    name: "Blue Theme",
    qrColor: "#1E40AF", 
    bgColor: "#FFFFFF", 
    textColor: "#1E40AF", 
    border: "2px solid #1E40AF",
  },
  {
    id: 3,
    name: "Green Theme",
    qrColor: "#065F46", 
    bgColor: "#FFFFFF", 
    textColor: "#065F46", 
    border: "2px solid #065F46", 
  },
  {
    id: 4,
    name: "Red Theme",
    qrColor: "#991B1B", 
    bgColor: "#FFFFFF", 
    textColor: "#991B1B", 
    border: "2px solid #991B1B", 
  },
  {
    id: 5,
    name: "Purple Theme",
    qrColor: "#5B21B6",
    bgColor: "#FFFFFF", 
    textColor: "#5B21B6",
    border: "2px solid #5B21B6",
  },
];

function MapComponent() {
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>({
    lat: 10.7951172,
    lng: 106.7195211,
  });

  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    type: "",
    hours: "",
  });
  const [isConfirming, setIsConfirming] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false); 
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [customText, setCustomText] = useState(""); 
  const [customText2, setCustomText2] = useState(""); 
  const [isConfirmingDownload, setIsConfirmingDownload] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(qrCodeTemplates[0]);

  const qrCodeRef = useRef<HTMLDivElement>(null); 
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_REACT_APP_API_KEY!,
    libraries: ["places"],
  });

  if (!isLoaded) return <div>Loading...</div>;

  const handleConfirm = () => {
    console.log("Business details confirmed:", businessDetails);
    setIsConfirming(false);
    setShowQRCode(true); 
  };

  const handleEdit = () => {
    setIsConfirming(false);
  };

  const downloadQRCode = (qrCodeRef: React.RefObject<HTMLDivElement>) => {
    if (qrCodeRef.current) {
      html2canvas(qrCodeRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "qrcode.png"; 
        link.click();
      });
    }
  };

  const handleDownloadClick = () => {
    setIsConfirmingDownload(true);
  };


  return (
    <APIProvider apiKey={import.meta.env.VITE_REACT_APP_API_KEY!}>
      <div className="flex flex-col w-full justify-around items-stretch h-full mx-auto max-w-4xl">
        <div id="map" className="h-[400px] w-full mt-[15px]">
          <Map zoom={15} center={selected}>
            {selected && <Marker position={selected} />}
          </Map>
        </div>
        <div className="places-container mt-4">
          <PlacesAutocomplete
            setSelected={(position) => {
              setSelected(position);
            }}
            setBusinessDetails={setBusinessDetails}
            setPlaceId={setPlaceId} 
          />
        </div>
      <button
          onClick={() => setIsConfirming(true)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
        >
          Confirm Business Details
        </button>
        {isConfirming && (
          <BusinessConfirmation
            businessDetails={businessDetails}
            onConfirm={handleConfirm}
            onEdit={handleEdit}
          />
        )}
        {showQRCode && placeId && (
          <div className="mt-6 p-4 bg-white border border-gray-300 rounded-md shadow-sm">
            <div>
              <label htmlFor="custom-text" className="block text-sm font-medium text-gray-700">
                Enter Business Display Name:
              </label>
              <input
                type="text"
                id="custom-text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                maxLength={30} // Set a maximum length for the input
                className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Bennam solutions"
              />
              <p className="text-sm text-gray-500 mt-1">
                {customText.length}/30 characters
              </p>
            </div>
            <div className="mt-4">
              <label htmlFor="custom-text" className="block text-sm font-medium text-gray-700">
                Enter Review Request:
              </label>
              <input
                type="text"
                id="custom-text"
                value={customText2}
                onChange={(e) => setCustomText2(e.target.value)}
                maxLength={30} // Set a maximum length for the input
                className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Please Review my Company"
              />
              <p className="text-sm text-gray-500 mt-1">
                {customText2.length}/30 characters
              </p>
            </div>
            <div className="mt-4">
              <label htmlFor="template-select" className="block text-sm font-medium text-gray-700">
                Choose QR Code Template:
              </label>
              <select
                id="template-select"
                value={selectedTemplate.id}
                onChange={(e) => {
                  const selectedId = parseInt(e.target.value);
                  const template = qrCodeTemplates.find((t) => t.id === selectedId);
                  if (template) setSelectedTemplate(template);
                }}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {qrCodeTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            <h2 className="text-xl font-bold mb-4 mt-4">QR Code for Review</h2>
            <div
              className="flex justify-center p-4 rounded-md"
              style={{
                backgroundColor: selectedTemplate.bgColor,
                border: selectedTemplate.border,
              }}
            >
              <div ref={qrCodeRef}>
                <QRCodeSVG
                  value={`https://search.google.com/local/writereview?placeid=${placeId}`}
                  size={256}
                  level="H"
                  fgColor={selectedTemplate.qrColor}
                  className="my-6"
                />
                {customText && (
                  <p
                    className="mt-2 text-center"
                    style={{ color: selectedTemplate.textColor }}
                  >
                    {customText}
                  </p>
                )}
                {customText2 && (
                  <p
                    className="mt-2 text-center"
                    style={{ color: selectedTemplate.textColor }}
                  >
                    {customText2}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-4 text-center text-gray-600">
              Scan this QR code to leave a review for this business.
            </p>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleDownloadClick}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 cursor-pointer"
              >
                Download QR Code
              </button>
            </div>
          </div>
        )}
        <div className="mb-6"></div>

        <ConfirmationDialog
          isOpen={isConfirmingDownload}
          onConfirm={() => downloadQRCode(qrCodeRef)}
          onCancel={() => setIsConfirmingDownload(false)}
          qrCodeRef={qrCodeRef}
          placeId={placeId!}
          customText={customText}
          customText2={customText2}
          selectedTemplate={selectedTemplate}
        />

      </div>
    </APIProvider>
  );
}

interface PlacesAutocompleteProps {
  setSelected: (position: { lat: number; lng: number } | null) => void;
  setBusinessDetails: (details: BusinessDetails) => void;
  setPlaceId: (placeId: string) => void;
}

const PlacesAutocomplete = ({
  setSelected,
  setBusinessDetails,
  setPlaceId,
}: PlacesAutocompleteProps) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();

    const results = await getGeocode({ address });
    console.log("address: ", results);

    const { lat, lng } = await getLatLng(results[0]);
    setSelected({ lat, lng });

    const placeId = results[0].place_id;
    setPlaceId(placeId);

    const placeDetails = await fetchPlaceDetails(placeId);

    console.log("placeDetails: ", placeDetails);

    const confirmPlaceDetail: BusinessDetails = {
      name: placeDetails.name!,
      address: results[0].formatted_address,
      phone: placeDetails.formatted_phone_number!,
      email: "",
      website: placeDetails.website!,
      type: "",
      hours: placeDetails.opening_hours?.weekday_text?.join(", ")!,
    };

    setBusinessDetails(confirmPlaceDetail);

    console.log("lat: ", lat);
    console.log("lng: ", lng);
  };

  const fetchPlaceDetails = async (placeId: string) => {
    const service = new google.maps.places.PlacesService(
      document.createElement("div")
    );

    return new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
      service.getDetails({ placeId }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          reject(new Error("Place details request failed"));
        }
      });
    });
  };

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search an address"
      />
      {status === "OK" && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description)}
              className="p-2 cursor-pointer hover:bg-gray-100"
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface BusinessConfirmationProps {
  businessDetails: BusinessDetails;
  onConfirm: () => void;
  onEdit: () => void;
}

const BusinessConfirmation = ({
  businessDetails,
  onConfirm,
  onEdit,
}: BusinessConfirmationProps) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-4 border border-gray-300 rounded-md shadow-sm">
      <h2 className="text-xl font-bold mb-4">Confirm Your Business Details</h2>
      <div className="space-y-3">
        <div>
          <strong>Business Name:</strong> {businessDetails.name}
        </div>
        <div>
          <strong>Address:</strong> {businessDetails.address}
        </div>
        <div>
          <strong>Phone:</strong> {businessDetails.phone}
        </div>
        <div>
          <strong>Email:</strong> {businessDetails.email}
        </div>
        <div>
          <strong>Website:</strong> {businessDetails.website}
        </div>
        <div>
          <strong>Business Type:</strong> {businessDetails.type}
        </div>
        <div>
          <strong>Operating Hours:</strong> {businessDetails.hours}
        </div>
      </div>
      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={onEdit}
          className="flex-1 px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 cursor-pointer"
        >
          Edit Details
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
        >
          Confirm and Proceed
        </button>
      </div>
    </div>
  );
};

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  qrCodeRef: React.RefObject<HTMLDivElement>;
  placeId: string;
  customText: string;
  customText2: string;
  selectedTemplate: {
    qrColor: string;
    bgColor: string;
    textColor: string;
    border: string;
  };
}

const ConfirmationDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  qrCodeRef,
  placeId,
  customText,
  customText2,
  selectedTemplate,
}: ConfirmationDialogProps) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Confirm QR Code</h2>
        <div
          className="flex justify-center p-4 rounded-md"
          style={{
            backgroundColor: selectedTemplate.bgColor,
            border: selectedTemplate.border,
          }}
        >
          <div ref={qrCodeRef} className="my-4">
            <QRCodeSVG
              value={`https://search.google.com/local/writereview?placeid=${placeId}`}
              size={256}
              level="H"
              fgColor={selectedTemplate.qrColor}
            />
            {customText && (
              <p
                className="mt-2 text-center"
                style={{ color: selectedTemplate.textColor }}
              >
                {customText}
              </p>
            )}
            {customText2 && (
              <p
                className="mt-2 text-center"
                style={{ color: selectedTemplate.textColor }}
              >
                {customText2}
              </p>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-gray-800 font-semibold">
          Is this the QR code you want to download?
        </p>
        <div className="mt-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number:
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your phone number"
          />
        </div>
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!email || !phone}
            className={`px-4 py-2 ${
              email && phone ? "bg-green-500 hover:bg-green-600 cursor-pointer" : "bg-gray-300 cursor-not-allowed"
            } text-white rounded-md`}
          >
            Confirm and Download
          </button>
        </div>
      </div>
    </div>
  );
};