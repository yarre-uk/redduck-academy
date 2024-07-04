import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const img1 =
  "https://cdn.wcs.org/2022/05/23/2ibwo5nyey_76768945_200ee080_6772_11ea_99f1_23346ee95a58.jpg";
const img2 =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpz6-_dGtrY6kDdHfCsBb6K6uokCkXmp4YoA&s";
const img3 =
  "https://cdn.wcs.org/2022/05/23/8ejzemcnfp_Julie_Larsen_Maher_0514_American_Alligator_WOR_BZ_10_27_11_hr.jpg";
const img4 =
  "https://cdn.wcs.org/2022/05/23/6bl5tpj3t0_Julie_Larsen_Maher_0014_King_Penguins_PNP_CPZ_11_29_10_hr.jpg";
const img5 =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWOjrZlpmiRw_qohp0hHrA593OeZJwtV6fYw&s";

export default buildModule("ERC721", (m) => {
  const erc721 = m.contract("MyERC721", []);

  const user1 = m.getAccount(0);
  const user2 = m.getAccount(1);
  const user3 = m.getAccount(2);

  m.call(erc721, "createNFT", [img1], { id: "createNFT1", from: user1 });
  m.call(erc721, "createNFT", [img2], { id: "createNFT2", from: user2 });
  m.call(erc721, "createNFT", [img3], { id: "createNFT3", from: user3 });
  m.call(erc721, "createNFT", [img4], { id: "createNFT4", from: user1 });
  m.call(erc721, "createNFT", [img5], { id: "createNFT5", from: user2 });

  return { erc721 };
});
