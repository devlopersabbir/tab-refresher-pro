// import { AsinGroup } from "../@types/index.js";
// import { groupStorage, priceStorage } from "../services/storage-instances.js";
// import { useStorage } from "./useStorage.js";

// export function useAppSettings() {
//   const [groups, setGroups] = useStorage(groupStorage);
//   const [price, setPrice] = useStorage(priceStorage);

//   const addGroup = async (newGroup: Omit<AsinGroup, "id">) => {
//     const current = groups ?? [];
//     const groupWithId = {
//       id: current.length > 0 ? current[current.length - 1].id + 1 : 1,
//       ...newGroup,
//     };
//     const updated = [...current, groupWithId];
//     await setGroups(updated);
//   };

//   const deleteGroup = async (id: number) => {
//     if (!groups) return;
//     const updated = groups.filter((g) => g.id !== id);
//     await setGroups(updated);
//   };

//   const updateGroup = async (updatedGroup: AsinGroup) => {
//     if (!groups) return;
//     const updated = groups.map((g) =>
//       g.id === updatedGroup.id ? updatedGroup : g
//     );
//     await setGroups(updated);
//   };

//   return {
//     groups,
//     price,
//     setPrice,
//     addGroup,
//     deleteGroup,
//     updateGroup,
//   };
// }
