// import { useEffect, useState } from "react";
// import { AsinGroup } from "../@types/index.js";
// import { storageAPI } from "../services/storage-service.js";

// export function useGroups() {
//   const [groups, setGroups] = useState<AsinGroup[]>([]);
//   const [price, setPrice] = useState<string>("");

//   // Fetch groups from storage
//   const fetchGroups = async () => {
//     const data = await storageAPI.get(["group"]);
//     if (data && Array.isArray(data.group)) {
//       setGroups(data.group);
//     } else {
//       setGroups([]);
//     }
//     return data.group;
//   };
//   const fetchPrice = async () => {
//     const { price } = await storageAPI.get(["price"]);
//     setPrice(`${price}`);
//     return `${price}`;
//   };

//   useEffect(() => {
//     fetchGroups();
//     fetchPrice();
//   }, []);

//   // update price
//   const updatePrice = async (price: string) => {
//     await storageAPI.set({ price });
//     setPrice(price);
//   };

//   // Add a new group (append to existing)
//   const addGroup = async (newGroup: Omit<AsinGroup, "id">) => {
//     const latestData = await storageAPI.get(["group"]);
//     const currentGroups = Array.isArray(latestData.group)
//       ? latestData.group
//       : [];

//     const groupWithId: AsinGroup = {
//       id:
//         currentGroups.length > 0
//           ? currentGroups[currentGroups.length - 1].id + 1
//           : 1,
//       ...newGroup,
//     };

//     const updatedGroups = [...currentGroups, groupWithId];
//     await storageAPI.set({ group: updatedGroups });
//     setGroups(updatedGroups);
//   };

//   // Delete a group by id
//   const deleteGroup = async (id: number) => {
//     const updated = groups.filter((g) => g.id !== id);
//     await storageAPI.set({ group: updated });
//     setGroups(updated);
//   };

//   // Update a group
//   const updateGroup = async (updatedGroup: AsinGroup) => {
//     const updated = groups.map((g) =>
//       g.id === updatedGroup.id ? updatedGroup : g
//     );
//     await storageAPI.set({ group: updated });
//     setGroups(updated);
//   };

//   return {
//     groups,
//     price,
//     addGroup,
//     deleteGroup,
//     updateGroup,
//     fetchGroups,
//     fetchPrice,
//     updatePrice,
//   };
// }
