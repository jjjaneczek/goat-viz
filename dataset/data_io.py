import json

json_data = None

with open("dataset/goat_dataset.json", "r", encoding='utf-8') as f:
    print(type(f))
    json_data = json.load(f)

for category, cate_entries in json_data.items():
    # globals()[key] = value
    if (category == "metadata"):
        continue

    # print(f"Category: {category}")

    for entry in cate_entries:
        # print(entry)
        if (entry["name"] != None):
            print(entry["name"])