import * as React from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { populateChain, fetcher } from "../../utils";
import AddNetwork from "../../components/chain";
import Layout from "../../components/Layout";
import RPCList from "../../components/RPCList";
import chainIds from "../../constants/chainIds";

export async function getStaticProps({ params, locale }) {
  const chains = await fetcher("https://chainid.network/chains.json");

  const chainTvls = await fetcher("https://api.llama.fi/chains");

  const chain = chains.find(
    (c) =>
      c.chainId?.toString() === params.chain ||
      c.chainId?.toString() ===
        Object.entries(chainIds).find(
          ([, name]) => params.chain === name
        )?.[0] ||
      c.name.toLowerCase() === params.chain.toLowerCase().split("%20").join(" ")
  );

  if (!chain) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      chain: chain ? populateChain(chain, chainTvls) : null,
      messages: (await import(`../../translations/${locale}.json`)).default,
    },
    revalidate: 3600,
  };
}

export async function getStaticPaths() {
  // const res = await fetcher("https://chainid.network/chains.json");

  // const chainNameAndIds = [
  //   ...res.map((c) => c.chainId),
  //   ...Object.values(chainIds),
  //   ...res.map((c) => c.name.toLowerCase().split(" ").join("%20")),
  // ];

  // const paths = chainNameAndIds.map((chain) => ({
  //   params: { chain: chain.toString() ?? null },
  // }));

  return { paths: [], fallback: "blocking" };
}

function Chain({ chain }) {
  const t = useTranslations("Common");

  const icon = React.useMemo(() => {
    return chain?.chainSlug
      ? `https://defillama.com/chain-icons/rsz_${chain.chainSlug}.jpg`
      : "/unknown-logo.png";
  }, [chain]);

  return (
    <>
      <Head>
        <title>{`${chain.name} RPC and Chain settings | Chainlist`}</title>
        <meta
          name="description"
          content={`Find the best ${chain.name} RPC to connect to your wallets and Web3 middleware providers.`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className="shadow bg-white p-8 rounded-[10px] flex flex-col gap-3 overflow-hidden">
          <Link
            href={`/chain/${chain.chainId}`}
            prefetch={false}
            className="flex items-center mx-auto gap-2"
          >
            <Image
              src={icon}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/chains/unknown-logo.png";
              }}
              width={26}
              height={26}
              className="rounded-full flex-shrink-0 flex relative"
              alt={chain.name + " logo"}
            />
            <span className="text-xl font-semibold overflow-hidden text-ellipsis relative top-[1px]">
              {chain.name}
            </span>
          </Link>

          <table>
            <thead>
              <tr>
                <th className="font-normal text-gray-500">ChainID</th>
                <th className="font-normal text-gray-500">{t("currency")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center font-bold px-4">{chain.chainId}</td>
                <td className="text-center font-bold px-4">
                  {chain.nativeCurrency ? chain.nativeCurrency.symbol : "none"}
                </td>
              </tr>
            </tbody>
          </table>

          <AddNetwork chain={chain} buttonOnly />
        </div>

        <RPCList chain={chain} />
      </Layout>
    </>
  );
}

export default Chain;
