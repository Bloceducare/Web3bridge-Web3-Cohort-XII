import { useState } from 'react'
import * as Chakra from './components/chakra-imports'
import { useUniswapPair } from './hooks/useUniswapPair'
import { ethers } from 'ethers'
import { useThemeColors } from './hooks/useThemeColors'

function App() {
  const [pairAddress, setPairAddress] = useState('')
  const { pairData, loading, error } = useUniswapPair(pairAddress)
  const toast = Chakra.useToast()
  const themeColors = useThemeColors()

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!pairAddress) {
      toast({
        title: 'Error',
        description: 'Please enter a pair address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      ethers.getAddress(pairAddress)
    } catch (error) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Ethereum address (0x...)',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    if (pairAddress.length !== 42) {
      toast({
        title: 'Invalid Address Length',
        description: 'Ethereum addresses must be 42 characters long (0x + 40 hex characters)',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    if (!pairAddress.startsWith('0x')) {
      toast({
        title: 'Invalid Address Format',
        description: 'Ethereum addresses must start with "0x"',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(pairAddress)) {
      toast({
        title: 'Invalid Address Format',
        description: 'Address contains invalid characters. Only hex characters (0-9, a-f) are allowed',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }
  }

  const formatNumber = (number, decimals) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(ethers.formatUnits(number, decimals))
  }

  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Chakra.ChakraProvider>
      <Chakra.Box 
        minH="100vh" 
        display="flex" 
        flexDirection="column"
        bg={themeColors.bgColor}
        backgroundAttachment="fixed"
        backgroundSize="cover"
        backgroundPosition="center"
        position="relative"
      >
        <Chakra.Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={themeColors.overlayBg}
          pointerEvents="none"
        />

        <Chakra.Box 
          as="header" 
          bg={themeColors.headerBg}
          backdropFilter="blur(10px)"
          borderBottom="1px" 
          borderColor={themeColors.borderColor}
          py={4}
          position="sticky"
          top={0}
          zIndex={100}
        >
          <Chakra.Container maxW="container.xl">
            <Chakra.Flex justify="space-between" align="center">
              <Chakra.HStack spacing={4}>
                <Chakra.Heading 
                  size="md" 
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  bgClip="text"
                  fontWeight="bold"
                >
                  Uniswap V2 Explorer
                </Chakra.Heading>
                <Chakra.Badge colorScheme="blue">Beta</Chakra.Badge>
              </Chakra.HStack>
              <Chakra.HStack spacing={4}>
                <Chakra.Link 
                  href="https://github.com/ObiamakaMaria/UniSwapV2_Interaction_Dapp" 
                  isExternal
                  color={themeColors.textSecondaryColor}
                  _hover={{ color: themeColors.linkHoverColor }}
                >
                  <Chakra.Icon as={Chakra.LinkIcon} w={5} h={5} />
                </Chakra.Link>
              </Chakra.HStack>
            </Chakra.Flex>
          </Chakra.Container>
        </Chakra.Box>

        <Chakra.Box flex="1" py={10} position="relative" zIndex={1}>
          <Chakra.Container maxW="container.md">
            <Chakra.VStack spacing={8}>
              <Chakra.Box textAlign="center" maxW="2xl">
                <Chakra.Heading 
                  size="2xl" 
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  bgClip="text"
                  fontWeight="bold"
                  mb={4}
                >
                  Uniswap V2 Pair Explorer
                </Chakra.Heading>
                <Chakra.Text color={themeColors.textSecondaryColor} fontSize="lg">
                  Enter any Uniswap V2 pair address to view detailed information about the trading pair, including reserves, token details, and more.
                </Chakra.Text>
              </Chakra.Box>
              
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <Chakra.Stack direction="row" spacing={4}>
                  <Chakra.Input
                    placeholder="Enter Uniswap V2 pair address"
                    value={pairAddress}
                    onChange={(e) => setPairAddress(e.target.value)}
                    size="lg"
                    bg={themeColors.cardBg}
                    borderColor={themeColors.borderColor}
                    _hover={{ borderColor: 'blue.400' }}
                    _focus={{ borderColor: 'blue.400' }}
                  />
                  <Chakra.Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    isLoading={loading}
                    px={8}
                  >
                    Fetch Data
                  </Chakra.Button>
                </Chakra.Stack>
              </form>

              {error && (
                <Chakra.Card w="100%" bg="red.50" borderColor="red.200">
                  <Chakra.CardBody>
                    <Chakra.HStack>
                      <Chakra.Icon as={Chakra.InfoIcon} color="red.500" />
                      <Chakra.Text color="red.700">{error}</Chakra.Text>
                    </Chakra.HStack>
                  </Chakra.CardBody>
                </Chakra.Card>
              )}

              {loading ? (
                <Chakra.Flex h="400px" align="center" justify="center">
                  <Chakra.Spinner size="xl" color="blue.500" thickness="4px" />
                </Chakra.Flex>
              ) : pairData ? (
                <Chakra.Card w="100%" bg={themeColors.cardBg} borderColor={themeColors.borderColor}>
                  <Chakra.CardBody>
                    <Chakra.Stack spacing={6}>
                      <Chakra.Box>
                        <Chakra.HStack mb={4}>
                          <Chakra.Heading size="md">Pair Address</Chakra.Heading>
                          <Chakra.Badge colorScheme="blue">V2</Chakra.Badge>
                        </Chakra.HStack>
                        <Chakra.Link 
                          href={`https://etherscan.io/address/${pairAddress}`}
                          isExternal
                          color={themeColors.linkColor}
                          _hover={{ color: themeColors.linkHoverColor }}
                        >
                          {pairAddress} <Chakra.ExternalLinkIcon mx="2px" />
                        </Chakra.Link>
                      </Chakra.Box>

                      <Chakra.Divider />

                      <Chakra.Box>
                        <Chakra.Heading size="md" mb={4}>Token Information</Chakra.Heading>
                        <Chakra.SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <Chakra.Card variant="outline" bg={themeColors.cardHoverBg}>
                            <Chakra.CardBody>
                              <Chakra.Stack spacing={3}>
                                <Chakra.HStack justify="space-between">
                                  <Chakra.Text fontWeight="bold">Token 0</Chakra.Text>
                                  <Chakra.Badge colorScheme="purple">{pairData.token0.symbol}</Chakra.Badge>
                                </Chakra.HStack>
                                <Chakra.Stack spacing={2}>
                                  <Chakra.HStack>
                                    <Chakra.Text color={themeColors.textSecondaryColor}>Name:</Chakra.Text>
                                    <Chakra.Text>{pairData.token0.name}</Chakra.Text>
                                  </Chakra.HStack>
                                  <Chakra.HStack>
                                    <Chakra.Text color={themeColors.textSecondaryColor}>Address:</Chakra.Text>
                                    <Chakra.Tooltip label={pairData.token0.address} placement="top">
                                      <Chakra.Link 
                                        href={`https://etherscan.io/token/${pairData.token0.address}`}
                                        isExternal
                                        color={themeColors.linkColor}
                                        maxW="200px"
                                        noOfLines={1}
                                      >
                                        {truncateAddress(pairData.token0.address)} <Chakra.ExternalLinkIcon mx="2px" />
                                      </Chakra.Link>
                                    </Chakra.Tooltip>
                                  </Chakra.HStack>
                                  <Chakra.HStack>
                                    <Chakra.Text color={themeColors.textSecondaryColor}>Decimals:</Chakra.Text>
                                    <Chakra.Text>{pairData.token0.decimals}</Chakra.Text>
                                  </Chakra.HStack>
                                </Chakra.Stack>
                              </Chakra.Stack>
                            </Chakra.CardBody>
                          </Chakra.Card>

                          <Chakra.Card variant="outline" bg={themeColors.cardHoverBg}>
                            <Chakra.CardBody>
                              <Chakra.Stack spacing={3}>
                                <Chakra.HStack justify="space-between">
                                  <Chakra.Text fontWeight="bold">Token 1</Chakra.Text>
                                  <Chakra.Badge colorScheme="green">{pairData.token1.symbol}</Chakra.Badge>
                                </Chakra.HStack>
                                <Chakra.Stack spacing={2}>
                                  <Chakra.HStack>
                                    <Chakra.Text color={themeColors.textSecondaryColor}>Name:</Chakra.Text>
                                    <Chakra.Text>{pairData.token1.name}</Chakra.Text>
                                  </Chakra.HStack>
                                  <Chakra.HStack>
                                    <Chakra.Text color={themeColors.textSecondaryColor}>Address:</Chakra.Text>
                                    <Chakra.Tooltip label={pairData.token1.address} placement="top">
                                      <Chakra.Link 
                                        href={`https://etherscan.io/token/${pairData.token1.address}`}
                                        isExternal
                                        color={themeColors.linkColor}
                                        maxW="200px"
                                        noOfLines={1}
                                      >
                                        {truncateAddress(pairData.token1.address)} <Chakra.ExternalLinkIcon mx="2px" />
                                      </Chakra.Link>
                                    </Chakra.Tooltip>
                                  </Chakra.HStack>
                                  <Chakra.HStack>
                                    <Chakra.Text color={themeColors.textSecondaryColor}>Decimals:</Chakra.Text>
                                    <Chakra.Text>{pairData.token1.decimals}</Chakra.Text>
                                  </Chakra.HStack>
                                </Chakra.Stack>
                              </Chakra.Stack>
                            </Chakra.CardBody>
                          </Chakra.Card>
                        </Chakra.SimpleGrid>
                      </Chakra.Box>

                      <Chakra.Divider />

                      <Chakra.Box>
                        <Chakra.Heading size="md" mb={4}>Reserves</Chakra.Heading>
                        <Chakra.Card variant="outline" bg={themeColors.cardHoverBg}>
                          <Chakra.CardBody>
                            <Chakra.Stack spacing={4}>
                              <Chakra.HStack justify="space-between">
                                <Chakra.Text fontWeight="bold">{pairData.token0.symbol} Reserve</Chakra.Text>
                                <Chakra.Text>{formatNumber(pairData.reserves.reserve0, pairData.token0.decimals)}</Chakra.Text>
                              </Chakra.HStack>
                              <Chakra.HStack justify="space-between">
                                <Chakra.Text fontWeight="bold">{pairData.token1.symbol} Reserve</Chakra.Text>
                                <Chakra.Text>{formatNumber(pairData.reserves.reserve1, pairData.token1.decimals)}</Chakra.Text>
                              </Chakra.HStack>
                              <Chakra.HStack>
                                <Chakra.Icon as={Chakra.TimeIcon} color={themeColors.textSecondaryColor} />
                                <Chakra.Text color={themeColors.textSecondaryColor}>
                                  Last Update: {new Date(Number(pairData.reserves.timestamp) * 1000).toLocaleString()}
                                </Chakra.Text>
                              </Chakra.HStack>
                            </Chakra.Stack>
                          </Chakra.CardBody>
                        </Chakra.Card>
                      </Chakra.Box>

                      <Chakra.Divider />

                      <Chakra.Box>
                        <Chakra.Heading size="md" mb={4}>LP Token</Chakra.Heading>
                        <Chakra.Card variant="outline" bg={themeColors.cardHoverBg}>
                          <Chakra.CardBody>
                            <Chakra.HStack justify="space-between">
                              <Chakra.Text fontWeight="bold">Total Supply</Chakra.Text>
                              <Chakra.Text>{formatNumber(pairData.totalSupply, 18)}</Chakra.Text>
                            </Chakra.HStack>
                          </Chakra.CardBody>
                        </Chakra.Card>
                      </Chakra.Box>
                    </Chakra.Stack>
                  </Chakra.CardBody>
                </Chakra.Card>
              ) : null}
            </Chakra.VStack>
          </Chakra.Container>
        </Chakra.Box>

        <Chakra.Box 
          as="footer" 
          bg={themeColors.footerBg}
          backdropFilter="blur(10px)"
          borderTop="1px" 
          borderColor={themeColors.borderColor}
          py={8}
          position="relative"
          zIndex={1}
        >
          <Chakra.Container maxW="container.xl">
            <Chakra.SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <Chakra.Box>
                <Chakra.Heading size="sm" mb={4}>About</Chakra.Heading>
                <Chakra.Text color={themeColors.textSecondaryColor}>
                  Uniswap V2 Explorer is a tool for viewing detailed information about Uniswap V2 trading pairs.
                </Chakra.Text>
              </Chakra.Box>
              <Chakra.Box>
                <Chakra.Heading size="sm" mb={4}>Resources</Chakra.Heading>
                <Chakra.Stack spacing={2}>
                  <Chakra.Link href="https://uniswap.org/docs/v2" isExternal color={themeColors.linkColor}>
                    Uniswap V2 Documentation <Chakra.ExternalLinkIcon mx="2px" />
                  </Chakra.Link>
                  <Chakra.Link href="https://etherscan.io" isExternal color={themeColors.linkColor}>
                    Etherscan <Chakra.ExternalLinkIcon mx="2px" />
                  </Chakra.Link>
                </Chakra.Stack>
              </Chakra.Box>
              <Chakra.Box>
                <Chakra.Heading size="sm" mb={4}>Connect</Chakra.Heading>
                <Chakra.Stack spacing={2}>
                  <Chakra.Link href="https://github.com/ObiamakaMaria/UniSwapV2_Interaction_Dapp" isExternal color={themeColors.linkColor}>
                    GitHub <Chakra.ExternalLinkIcon mx="2px" />
                  </Chakra.Link>
                  <Chakra.Text color={themeColors.textSecondaryColor}>Made with ❤️ for the Ethereum community</Chakra.Text>
                </Chakra.Stack>
              </Chakra.Box>
            </Chakra.SimpleGrid>
            <Chakra.Divider my={8} />
            <Chakra.Text textAlign="center" color={themeColors.textSecondaryColor}>
              © {new Date().getFullYear()} Uniswap V2 Explorer. All rights reserved.
            </Chakra.Text>
          </Chakra.Container>
        </Chakra.Box>
      </Chakra.Box>
    </Chakra.ChakraProvider>
  )
}

export default App
