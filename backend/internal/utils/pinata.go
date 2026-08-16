package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

func PinJSONToIPFS(payload map[string]interface{}) (string, error) {
	pinataJWT := os.Getenv("PINATA_JWT")
	if pinataJWT == "" {
		return "", fmt.Errorf("PINATA_JWT not set in .env")
	}

	// Wrap payload per the Pinata standard.
	pinataPayload := map[string]interface{}{
		"pinataContent": payload,
		"pinataMetadata": map[string]interface{}{
			"name": fmt.Sprintf("Pilah_Proof_%v", payload["order_id"]),
		},
	}

	jsonData, err := json.Marshal(pinataPayload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.pinata.cloud/pinning/pinJSONToIPFS", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+pinataJWT)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("Pinata error: status code %d", resp.StatusCode)
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	if hash, ok := result["IpfsHash"].(string); ok {
		return hash, nil
	}

	return "", fmt.Errorf("failed to parse IpfsHash from response")
}
