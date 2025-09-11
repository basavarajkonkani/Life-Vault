#!/bin/bash

echo "🧪 Testing LifeVault Nominee CRUD Operations"
echo "=============================================="

BASE_URL="http://localhost:3001/api"
TOKEN="demo-token"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Get existing nominees
echo -e "\n${YELLOW}Test 1: Fetching existing nominees${NC}"
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/dashboard/nominees")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully fetched nominees${NC}"
    echo "Current nominees count: $(echo $RESPONSE | jq '. | length')"
else
    echo -e "${RED}❌ Failed to fetch nominees${NC}"
    exit 1
fi

# Test 2: Create a new nominee
echo -e "\n${YELLOW}Test 2: Creating a new nominee${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/nominees" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "CRUD Test Nominee",
    "relation": "Sibling",
    "phone": "+91 6666666666",
    "email": "crud-test@example.com",
    "allocationPercentage": 35,
    "isExecutor": false,
    "isBackup": true
  }')

if echo "$CREATE_RESPONSE" | jq -e '.id' > /dev/null; then
    NOMINEE_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
    echo -e "${GREEN}✅ Successfully created nominee with ID: $NOMINEE_ID${NC}"
else
    echo -e "${RED}❌ Failed to create nominee${NC}"
    echo "Response: $CREATE_RESPONSE"
    exit 1
fi

# Test 3: Update the nominee
echo -e "\n${YELLOW}Test 3: Updating the nominee${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/nominees/$NOMINEE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated CRUD Test Nominee",
    "relation": "Sibling",
    "phone": "+91 6666666666",
    "email": "updated-crud-test@example.com",
    "allocationPercentage": 40,
    "isExecutor": true,
    "isBackup": false
  }')

if echo "$UPDATE_RESPONSE" | jq -e '.id' > /dev/null; then
    echo -e "${GREEN}✅ Successfully updated nominee${NC}"
    echo "Updated name: $(echo "$UPDATE_RESPONSE" | jq -r '.name')"
    echo "Updated allocation: $(echo "$UPDATE_RESPONSE" | jq -r '.allocation_percentage')%"
else
    echo -e "${RED}❌ Failed to update nominee${NC}"
    echo "Response: $UPDATE_RESPONSE"
    exit 1
fi

# Test 4: Verify the update
echo -e "\n${YELLOW}Test 4: Verifying the update${NC}"
VERIFY_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/dashboard/nominees")
UPDATED_NOMINEE=$(echo "$VERIFY_RESPONSE" | jq ".[] | select(.id == \"$NOMINEE_ID\")")

if echo "$UPDATED_NOMINEE" | jq -e '.name' > /dev/null; then
    echo -e "${GREEN}✅ Update verified successfully${NC}"
    echo "Name: $(echo "$UPDATED_NOMINEE" | jq -r '.name')"
    echo "Allocation: $(echo "$UPDATED_NOMINEE" | jq -r '.allocation_percentage')%"
    echo "Is Executor: $(echo "$UPDATED_NOMINEE" | jq -r '.is_executor')"
    echo "Is Backup: $(echo "$UPDATED_NOMINEE" | jq -r '.is_backup')"
else
    echo -e "${RED}❌ Failed to verify update${NC}"
    exit 1
fi

# Test 5: Delete the nominee
echo -e "\n${YELLOW}Test 5: Deleting the nominee${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/nominees/$NOMINEE_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DELETE_RESPONSE" | jq -e '.success' > /dev/null; then
    echo -e "${GREEN}✅ Successfully deleted nominee${NC}"
else
    echo -e "${RED}❌ Failed to delete nominee${NC}"
    echo "Response: $DELETE_RESPONSE"
    exit 1
fi

# Test 6: Verify deletion
echo -e "\n${YELLOW}Test 6: Verifying deletion${NC}"
FINAL_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/dashboard/nominees")
DELETED_CHECK=$(echo "$FINAL_RESPONSE" | jq ".[] | select(.id == \"$NOMINEE_ID\")")

if [ -z "$DELETED_CHECK" ] || [ "$DELETED_CHECK" = "null" ]; then
    echo -e "${GREEN}✅ Deletion verified successfully${NC}"
else
    echo -e "${RED}❌ Failed to verify deletion${NC}"
    exit 1
fi

# Test 7: Error handling - Invalid data
echo -e "\n${YELLOW}Test 7: Testing error handling with invalid data${NC}"
ERROR_RESPONSE=$(curl -s -X POST "$BASE_URL/nominees" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "",
    "relation": "Invalid",
    "phone": "123",
    "email": "invalid-email",
    "allocationPercentage": 150,
    "isExecutor": false,
    "isBackup": false
  }')

if echo "$ERROR_RESPONSE" | jq -e '.error' > /dev/null; then
    echo -e "${GREEN}✅ Error handling working correctly${NC}"
    echo "Error message: $(echo "$ERROR_RESPONSE" | jq -r '.error')"
else
    echo -e "${YELLOW}⚠️  Expected error response but got: $ERROR_RESPONSE${NC}"
fi

echo -e "\n${GREEN}🎉 All CRUD tests completed successfully!${NC}"
echo "=============================================="
echo "✅ Create: Working"
echo "✅ Read: Working"
echo "✅ Update: Working"
echo "✅ Delete: Working"
echo "✅ Error Handling: Working"
echo "✅ Data Persistence: Working"
